import React from 'react'

export default function Transcription(props) {
  const { textElement, finished } = props
  return (
    <div>{textElement}</div>
  )
}
