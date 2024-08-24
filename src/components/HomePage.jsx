import React, {useState, useEffect, useRef} from 'react'

export default function HomePage(props) {
    const { setFile, setAudioStream } = props

    const [recordingStatus, setRecordingStatus] = useState('inactive')
    const [audioChunks, setAudioChunks] = useState([])
    const [duration, setDuration] = useState(0)
    
    const mediaRecorder = useRef(null)

    const mimeType ='audio/webm'

    async function startRecording() {
        let tempStream
        console.log('Start recording')

        // get the audio stream from the user's microphone
        try {
            const streamData = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false // request only the audio stream
            })
            tempStream = streamData
        } catch (err) {
            console.log(err.message)
            return
        }
        setRecordingStatus('recording')

        // create a new MediaRecorder instance using the stream
        const media = new MediaRecorder(tempStream, {type: mimeType})

        mediaRecorder.current = media

        mediaRecorder.current.start() // start recording
        let localAudioChunks = []
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === 'undefined') { return } // check if the event.data is undefined
            if (event.data.size === 0) { return } // check if the event.data.size is 0
            localAudioChunks.push(event.data) // push the event.data to the audioChunks array
        }
        setAudioChunks(localAudioChunks)
    }

    async function stopRecording() {
        setRecordingStatus('inactive')
        console.log('Stop recording')

        mediaRecorder.current.stop()
        // onstop event listener
        mediaRecorder.current.onstop = () => {
            const auidoBlob = new Blob(audioChunks, {type: mimeType})
            setAudioStream(auidoBlob)
            setAudioChunks([])
            setDuration(0)
        }
    }

    useEffect(() => {
        if (recordingStatus === 'inactive') { return }

        const interval = setInterval(() => {
            setDuration(curr => curr + 1)
        }, 1000)

        return () => clearInterval(interval)
    })

    return (
        <main className='flex-1 flex flex-col gap-3 sm:gap-4 justify-center text-center p-4 pb-20'>
            <h1 className='font-semibold text-5xl sm:text-6xl md:text-7xl'>
                Free<span className='text-blue-400 bold'>Scribe</span>
            </h1>
            <h3 className='front-meidum md:text-lg'>
                Record <span className='text-blue-400'>&rarr;</span> Transcribe <span className='text-blue-400'>&rarr;</span> Translate
            </h3>
            <button onClick={recordingStatus === 'recording' ? stopRecording : startRecording} className='specialBtn px-4 py-2 rounded-xl flex items-center justify-between text-base mx-auto gap-4 w-72 max-w-full my-4'>
                <p className='text-blue-400'>{recordingStatus === 'inactive' ? 'Record' : 'Stop recording'}</p>
                <div className='flex items-center gap-2'>
                    {duration !== 0 && (
                        <p className='text-sm'>{duration}s</p>
                    )}
                    <i className={"fa-solid duration-200 fa-microphone " + (recordingStatus === 'recording' ? 'text-rose-300' : '')}></i>
                </div>
            </button>
            <p className='text-base'>
                Or <label className='text-blue-400 cursor-pointer hover:text-blue-600 duration-200'>
                    upload <input onChange={(e) => {
                        const tempFile = e.target.files[0]
                        setFile(tempFile)
                    }} className='hidden' type='file' accept='.mp3, .wave'></input>
                </label>
                a mp3 file
            </p>
            <p className='italic text-slate-400'>Free now free forever</p>
        </main>
    )
}
