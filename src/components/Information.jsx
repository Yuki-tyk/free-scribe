import React, { useState, useEffect, useRef } from 'react'
import Transcription from './Transcription'
import Translation from './Translation'

export default function Information(props) {
    const { output, finished } = props
    const [tab, setTab] = useState('transcription')
    const [translation, setTranslation] = useState(null)
    const [toLanguage, setToLanguage] = useState('Select language')
    const [translating, setTranslating] = useState(null)
    console.log(output)

    const worker = useRef()

    useEffect(() => {
        if (!worker.current) { // create a new worker if it doesn't exist
            worker.current = new Worker(new URL('../utils/translate.worker.js', import.meta.url), {
              type: 'module'
            })
        }

        const onMessageReceived = async (e) => {
            // Handle message from the worker
            switch (e.data.status) {
              case 'initiate': {
                console.log('initiate')
                break;
              }
              case 'progress': {
                console.log('progress')
                break;
              }
              case 'update': {
                setTranslation(e.data.results)
                console.log(e.data.results)
                break;
              }
              case 'complete': {
                setTranslating(false)
                console.log('ready')
                break;
              }
            }
          }
      
          worker.current.addEventListener('message', onMessageReceived)
      
          return () => worker.current.removeEventListener('message', onMessageReceived)
    }, [])

    function handleCopy() {
        navigator.clipboard.writeText()
    }

    function handleDownload() {
        const element = document.createElement('a')
        const file = new Blob([], {type: 'text/plain'})
        element.href = URL.createObjectURL(file)
        element.download(`Freescribe_${(new Date()).toDateString()}.txt`)
        document.body.appendChild(element)
        element.click()
    } 

    function generateTranslation() {
        if (translating || toLanguage === 'Select language') { return }

        setTranslating(true)

        worker.current.postMessage({
            text: output.map(val => val.text),
            src_lang: 'en',
            tgt_lang: toLanguage
        })
    }

    const textElement = (tab === 'transcription') ? (output.map(val => val.text)) : ''

    return (
        <main className='flex-1 p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 w-full max-w-prose mx-auto'>
                <h1 className='font-semibold text-4xl sm: text-5xl md:text-6xl'>
                    Your <span className='text-blue-400 bold'>Transcription</span>
                </h1>

                <div className='grid grid-cols-2 mx-auto bg-white shadow rounded-full border-blue-300 items-center overflow-hidden'>
                    <button onClick={() => setTab('transcription')} className={'px-4 py-1 duration-200 ' + (tab === 'transcription' ? 'bg-blue-300 text-white' : 'text-blue-400 hover:text-blue-500')}>Transcription</button>
                    <button onClick={() => setTab('translation')} className={'px-4 py-1 duration-200 ' + (tab === 'translation' ? 'bg-blue-300 text-white' : 'text-blue-400 hover:text-blue-500')}>Translation</button>
                </div>
                <div className='my-8 flex flex-col'>
                    { tab === 'transcription' ? (
                        <Transcription {...props} textElement={textElement} />
                    ) : (
                        <Translation {...props} textElement={textElement} toLanguage={toLanguage} setToLanguage={setToLanguage} translating={translating} generateTranslation={generateTranslation} />
                    )}
                </div>
                <div className='flex items-center gap-4 mx-auto'>
                    <button title='Copy' className='bg-white text-blue-300 rounded px-2 aspect-square grid place-items-center hover:text-blue-500 duration-200'>
                        <i className="fa-solid fa-copy"></i>
                    </button>
                    <button title='Download' className='bg-white text-blue-300 rounded px-2 aspect-square grid place-items-center hover:text-blue-500 duration-200'>
                        <i className="fa-solid fa-download"></i>
                    </button>
                </div>
                
                
        </main>
    )
}
