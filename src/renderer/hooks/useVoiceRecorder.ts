import { useState, useEffect, useCallback, useRef } from 'react'

export type RecordingState = 'idle' | 'recording' | 'processing'

interface UseVoiceRecorderReturn {
  state: RecordingState
  isAvailable: boolean
  toggleRecording: () => Promise<void>
  error: string | null
}

/**
 * Hook for voice recording using MediaRecorder + OpenAI Whisper API
 */
export function useVoiceRecorder(onTranscription: (text: string) => void): UseVoiceRecorderReturn {
  const [state, setState] = useState<RecordingState>('idle')
  const [isAvailable, setIsAvailable] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // Check availability and load API key
  useEffect(() => {
    const init = async () => {
      console.log('[Voice] Initializing...')

      try {
        // Check for microphone
        const devices = await navigator.mediaDevices.enumerateDevices()
        const hasMic = devices.some(d => d.kind === 'audioinput')

        if (!hasMic) {
          console.log('[Voice] No microphone found')
          setIsAvailable(false)
          return
        }

        // Load API keys
        const result = await window.electronAPI.loadApiKeys()
        if (result.success && result.data) {
          const keys = result.data
          console.log('[Voice] API keys loaded:', Object.keys(keys))
          if (keys.openai) {
            console.log('[Voice] OpenAI API key found')
            setApiKey(keys.openai)
            setIsAvailable(true)
          } else if (keys.gemini) {
            console.log('[Voice] Only Gemini key found, no speech-to-text available')
            setIsAvailable(false)
          } else {
            console.log('[Voice] No API keys found')
            setIsAvailable(false)
          }
        } else {
          console.log('[Voice] Could not load API keys')
          setIsAvailable(false)
        }
      } catch (err) {
        console.error('[Voice] Init error:', err)
        setIsAvailable(false)
      }
    }

    init()
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  /**
   * Transcribe audio using OpenAI Whisper API
   */
  const transcribeWithWhisper = async (audioBlob: Blob): Promise<string> => {
    if (!apiKey) {
      throw new Error('No OpenAI API key')
    }

    console.log('[Voice] Sending to Whisper API, size:', audioBlob.size)

    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'hu') // Hungarian

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Voice] Whisper API error:', response.status, errorText)
      throw new Error(`Whisper API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('[Voice] Whisper response:', data)
    return data.text || ''
  }

  /**
   * Start recording
   */
  const startRecording = useCallback(async () => {
    console.log('[Voice] Starting recording...')
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      })

      console.log('[Voice] Microphone access granted')
      streamRef.current = stream
      chunksRef.current = []

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          console.log('[Voice] Chunk received:', event.data.size, 'bytes')
        }
      }

      mediaRecorder.onstop = async () => {
        console.log('[Voice] Recording stopped, processing...')
        setState('processing')

        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
          console.log('[Voice] Total audio size:', audioBlob.size, 'bytes')

          if (audioBlob.size < 1000) {
            console.log('[Voice] Audio too short, skipping')
            setError('Recording too short')
            setState('idle')
            return
          }

          const transcript = await transcribeWithWhisper(audioBlob)

          if (transcript.trim()) {
            console.log('[Voice] Transcript:', transcript)
            onTranscription(transcript.trim())
          } else {
            console.log('[Voice] Empty transcript')
          }
        } catch (err) {
          console.error('[Voice] Transcription error:', err)
          setError('Transcription failed')
        } finally {
          setState('idle')
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
          }
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Collect data every second
      setState('recording')
      console.log('[Voice] Recording started')

    } catch (err) {
      console.error('[Voice] Could not start recording:', err)
      setError('Could not access microphone')
      setState('idle')
    }
  }, [apiKey, onTranscription])

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    console.log('[Voice] Stopping recording...')

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
  }, [])

  /**
   * Toggle recording
   */
  const toggleRecording = useCallback(async () => {
    console.log('[Voice] Toggle, state:', state)

    if (state === 'recording') {
      stopRecording()
    } else if (state === 'idle') {
      await startRecording()
    }
  }, [state, startRecording, stopRecording])

  return {
    state,
    isAvailable,
    toggleRecording,
    error
  }
}
