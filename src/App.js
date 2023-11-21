import React, { useState, useEffect } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import './App.css';
import AzureTextSummarization from './Transcription';

import Typography from "@material-ui/core/Typography";
import WaveformVisualizer from "./WaveformVisualizer";
import { PulseLoader } from "react-spinners";
// import TranscribeOutput from "./TranscribeOutput";



function App() {

  const [transcription, setTranscription] = useState('');
  const [recentTranscription, setrecentTranscription] = useState('');
  const [latestTranscription, setlatestTranscription] = useState('');
  const [error, setError] = useState('');
  const [recognizer, setRecognizer] = useState(null);
  const [canTranscribe, setcanTranscribe] = useState(false);

  const API = "9eb5d7ece3844a909e2634289ac45f26"
  const API1 = '74a923d95b0a42d585a5d5e5ae6bf708'
  const REGION = 'uksouth'
  const ENDPOINT = 'https://maialanguage.cognitiveservices.azure.com/'

  const doc = [`The bush began to shake. Brad couldn't see what was causing it to shake, but he didn't care. he had a pretty good idea about what was going on and what was happening. He was so confident that he approached the bush carefree and with a smile on his face. That all changed the instant he realized what was actually behind the bush.
  She's asked the question so many times that she barely listened to the answers anymore. The answers were always the same. Well, not exactly the same, but the same in a general sense. A more accurate description was the answers never surprised her. So, she asked for the 10,000th time, "What's your favorite animal?" But this time was different. When she heard the young boy's answer, she wondered if she had heard him correctly.
  Have you ever wondered about toes? Why 10 toes and not 12. Why are some bigger than others? Some people can use their toes to pick up things while others can barely move them on command. Some toes are nice to look at while others are definitely not something you want to look at. Toes can be stubbed and make us scream. Toes help us balance and walk. 10 toes are just something to ponder.
  Then came the night of the first falling star. It was seen early in the morning, rushing over Winchester eastward, a line of flame high in the atmosphere. Hundreds must have seen it and taken it for an ordinary falling star. It seemed that it fell to earth about one hundred miles east of him.`]


  let transcription_array = []
  useEffect(() => {
    return () => {
      if (recognizer) {
        recognizer.close();
      }
    };
  }, [recognizer]);

  const startListening = async () => {
    try {
      const speechConfig = sdk.SpeechConfig.fromSubscription(API, REGION);
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

      const conversationTranscriber = new sdk.ConversationTranscriber(speechConfig, audioConfig);

      conversationTranscriber.sessionStarted = (s, e) => {
        console.log('Session started:', e.sessionId);
      };

      conversationTranscriber.sessionStopped = (s, e) => {
        console.log('Session stopped:', e.sessionId);
      };

      conversationTranscriber.canceled = (s, e) => {
        console.log('Canceled event:', e.errorDetails);
        setError(`Error: ${e.errorDetails}`);
        conversationTranscriber.stopTranscribingAsync();
      };

      conversationTranscriber.transcribed = (s, e) => {
        // console.log('Transcribed:', e.result.text);
        console.log("Speaker ID=" + e.result.speakerId + " TRANSCRIBED: Text=" + e.result.text);

        setTranscription((prevTranscription) => prevTranscription + e.result.text);
        // setTranscription(e.result.text);
        let data = {
          speaker: e.result.speakerId,
          text: e.result.text
        }
        // console.log(data.text)
        // data = ``
        // setTranscription((prevData) => [...prevData, data])
        // transcription_array.push(data)
        // console.log(transcription_array)

        // setTranscription((prevData) => [...prevData, e.result.text])

        // let id = 0

        // setTranscription.push({
        //   id: id++,
        //   speaker: e.result.speakerId,
        //   text: e.result.text
        // })
        // setrecentTranscription = transcription[transcription.length - 1]
        // // setrecentTranscription((prevTranscription) => prevTranscription
        console.log(transcription)
      };

      conversationTranscriber.startTranscribingAsync(
        () => {
          console.log('Continuous transcription started');
        },
        (err) => {
          console.error('Error starting continuous transcription:', err);
          setError(`Error starting continuous transcription: ${err}`);
        }
      );

      setRecognizer(conversationTranscriber);
    } catch (error) {
      console.error('Error initializing speech services:', error);
      setError(`Error initializing speech services: ${error.message}`);
    }
  };

  const stopListening = () => {
    if (recognizer) {
      recognizer.stopTranscribingAsync(
        () => {
          console.log('Continuous transcription stopped');
          setcanTranscribe(true)
        },
        (err) => {

          console.error('Error stopping continuous transcription:', err);
          setError(`Error stopping continuous transcription: ${err}`);
        }
      );
    }
  };

  return (
    <div>
      <div className="title">
        <Typography variant="h3">
          Speech Transcripter {" "}
          <span role="img" aria-label="microphone-emoji">
            🎤
          </span>
        </Typography>
      </div>
      <button onClick={startListening}>Start Listening</button>
      <button onClick={stopListening}>Stop Listening</button>
      <div>
        <h3>Transcription:</h3>
        {error && <p>Error: {error}</p>}
        <p>{transcription}</p>
        {/* <TranscribeOutput data={transcription} /> */}
        {/* <p>{recentTranscription}</p> */}
        {/* <p>{transcription}</p> */}

        {canTranscribe && (<AzureTextSummarization
          documents={[transcription]}
          apiKey={API1}
          endpoint={ENDPOINT}
        />)}
      </div>
    </div>


  );
};
export default App;
