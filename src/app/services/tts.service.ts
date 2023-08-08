import { Injectable } from '@angular/core';
import { KrameriusApiService } from './kramerius-api.service';
import { NotFoundError } from '../common/errors/not-found-error';
import { AltoService } from './alto-service';
import { UnauthorizedError } from '../common/errors/unauthorized-error';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs-compat';
import { AppSettings } from './app-settings';

@Injectable()
export class TtsService {

  private block = new Subject<any>();

  private temperature = 0;
  private maxTokens = 1000;
  private model = 'gpt-3.5-turbo'; 
  // private model = 'gpt-3.5-turbo-16k'; 
  // private model = 'text-davinci-003';
  private state: string = 'none';
  private blocks: any[] = [];

  activeBlockIndex: number = -1;

  audio: any;

  onFinished: () => void;


  constructor(private api: KrameriusApiService,
    private settings: AppSettings,
    private http: HttpClient,
    private altoService: AltoService) {
  } 



  readPage(uuid: string, onFinished: () => void) {
    this.state = 'loading';
    this.onFinished = onFinished;
    this.api.getAlto(uuid).subscribe(
        result => {
            const blocks = this.altoService.getBlocksForReading(result);
            console.log(blocks);
            this.blocks = blocks;
            this.next();
        },
        error => {
            if (error instanceof NotFoundError) {
              // todo not found
            } else if (error instanceof UnauthorizedError) {
              // todo unauthorized
            } else {
              // todo unexpected error
            }
        }
    );
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
    }
    this.finish(true);
  }

  watchBlock(): Observable<any> {
    return this.block.asObservable();
  }

  inProgress(): boolean { 
    return this.state === 'speaking' || this.state === 'loading';
  }

  private finish(fromUser: boolean = false) {
    this.state = 'none';
    this.blocks = null;
    this.activeBlockIndex = -1;
    this.block.next(null);
    if (this.onFinished && !fromUser) {
      this.onFinished();
    }
  }



  private next() {
    if (!this.blocks) {
      return;
    }
    console.log('next');
    console.log(this.activeBlockIndex);
    this.activeBlockIndex++;
    if (this.activeBlockIndex >= this.blocks.length) {
      this.finish();
      return;
    }
    const block = this.blocks[this.activeBlockIndex];
    this.block.next(block);
    console.log('bt', block.text);
    const tr = false;
    if (tr) {
      this.askGPT(block.text, "Přelož do češtiny", (answer) => {
        this.sayIt(answer);
      });
    } else {
      this.sayIt(block.text);
    }
  }

  private sayIt(text: string) {
    const token = this.settings.getToken();
    const url = `https://api.trinera.cloud/api/google/tts`;
    let headers = new HttpHeaders()
      .set('X-Tai-Source', location.href)
      .set('X-Tai-Project', `Kramerius`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', `application/json`);
    const body = {
      "audioConfig": {
        "audioEncoding": "LINEAR16",
        "effectsProfileId": [
          "small-bluetooth-speaker-class-device"
        ],
        "pitch": 0,
        "speakingRate": 1
      },
      "input": {
        "text": text
      },
      "voice": {
        "languageCode": "cs-CZ",
        "name": "cs-CZ-Wavenet-A"
      }
    };
    this.http.post(url, body, { headers: headers }).subscribe((repsonse: any) => {
      this.playAudioContent(repsonse['audioContent']);
    })
  }


  private playAudioContent(audioContent: string) {
    this.state = 'speaking'
    const audioData = this.base64ToUint8Array(audioContent);
    const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    this.audio = new Audio(audioUrl);
    this.audio.onended = (event) => {
      this.state = 'loading';
      this.next();
    };
    this.audio.stop
    this.audio.play();
  }



  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }




 askGPT(input: string, instructions: string, callback: (answer: string) => void) {
    let promt = !!instructions ? `${instructions}:\n\n${input}` : input;
    const token = this.settings.getToken();
    const url = `https://api.trinera.cloud/api/openai/chat/completions`;
    let headers = new HttpHeaders()
      .set('X-Tai-Source', location.href)
      .set('X-Tai-Project', `Kramerius`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', `application/json`);

    const body = {
      'model': this.model,
      'messages': [
        {
          "role": "system",
          "content": instructions
        },
        {
          "role": "user",
          "content": promt
        }
      ],
      'temperature': this.temperature,
      'max_tokens': this.maxTokens
    };
    this.http.post(url, body, { headers: headers }).subscribe((response: any) => {
      console.log('respnse', response);
      let answer = response['choices'][0]['message']['content'];
      const searchString = "\n\n";
      const startIndex = input.indexOf(searchString);
      if (startIndex !== -1 && startIndex < 10) {
        answer = answer.substring(startIndex + searchString.length);
      }
      callback(answer);
    });
  }


  translate(input: string, callback: (answer: string) => void) {
    const token = this.settings.getToken();
    const url = `https://api.trinera.cloud/api/deepl/translate`;
    let headers = new HttpHeaders()
      .set('X-Tai-Source', location.href)
      .set('X-Tai-Project', `Kramerius`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', `application/json`);
    const body = {
      'text': [input ],
      'target_lang': 'CS'
    };
    this.http.post(url, body, { headers: headers }).subscribe((response: any) => {
      console.log('respnse', response);
      const answer = response['translations'][0]['text'];
      callback(answer);
    });
  }



}
