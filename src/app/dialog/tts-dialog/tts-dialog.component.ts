import { Component, OnInit, ViewChild } from '@angular/core';
import { TtsService } from '../../services/tts.service';
import { MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '../../services/language.service';
import { MatLegacyMenuTrigger as MatMenuTrigger } from '@angular/material/legacy-menu';
import { AiService } from '../../services/ai.service';

@Component({
  selector: 'app-tts-dialog',
  templateUrl: './tts-dialog.component.html',
  styleUrls: ['./tts-dialog.component.scss']
})
export class TtsDialogComponent implements OnInit {

  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

  readingSource: string;
  readingLanguage: any;
  readingVoice: any;
  readingVoiceState: string;

  menuLanguage: any;

  languages = LanguageService.TRANSLANTABLE_LANGUAGES;
  // languages = ['en', 'cs', 'de', 'sk', 'sl', 'es', 'fr', 'pl', 'it', 'et', 'sv', 'hu', 'uk', 'ru', 'pt', 'lt', 'lv', 'zh-CN', 'zh-TW'];
  voices: any;
  showVoicesInGrid = false;

  constructor(
    private dialogRef: MatDialogRef<TtsDialogComponent>,
    public languageService: LanguageService,
    private ai: AiService,
    public tts: TtsService) {
      this.dialogRef.disableClose = true;

  }

  ngOnInit(): void {
    let generalVoices = TtsService.openAIVoices;
    if (this.ai.testActionsEnabled()) {
      generalVoices = generalVoices.concat(TtsService.elevenLabsVoices);
      this.showVoicesInGrid = true;
    }
    this.voices = {
      'en': generalVoices.concat(TtsService.googleVoicesByLanguage('en')),
      'de': generalVoices.concat(TtsService.googleVoicesByLanguage('de')),
      'cs': generalVoices.concat(TtsService.googleVoicesByLanguage('cs')),
      'sk': generalVoices.concat(TtsService.googleVoicesByLanguage('sk')),
      'sl': generalVoices.concat(TtsService.googleVoicesByLanguage('sl')),
      'es': generalVoices.concat(TtsService.googleVoicesByLanguage('es')),
      'pl': generalVoices.concat(TtsService.googleVoicesByLanguage('pl')),
      'it': generalVoices.concat(TtsService.googleVoicesByLanguage('it')),
      'uk': generalVoices.concat(TtsService.googleVoicesByLanguage('uk')),
      'ru': generalVoices.concat(TtsService.googleVoicesByLanguage('ru')),
      'pt': generalVoices.concat(TtsService.googleVoicesByLanguage('pt')),
      'lt': generalVoices.concat(TtsService.googleVoicesByLanguage('lt')),
      'lv': generalVoices.concat(TtsService.googleVoicesByLanguage('lv')),
      'fr': generalVoices.concat(TtsService.googleVoicesByLanguage('fr')),
      'zh-CN': generalVoices.concat(TtsService.googleVoicesByLanguage('zh-CN')),
      'zh-TW': generalVoices.concat(TtsService.googleVoicesByLanguage('zh-TW'))
    }
  }

  setVoiceMenu(language: any) {
    this.menuLanguage = language;
  }

  close() {
    this.tts.stopTestTTS();
    this.dialogRef.close();
  }

  closeMenu() {
    this.menuTrigger.closeMenu();
  }

  stopReading() {
    this.readingSource = null;
    this.readingLanguage = null;
    this.readingVoiceState = 'none';
    this.readingVoice = null;
    this.tts.stopTestTTS();
  }

  isVoiceReading(language: string, voice: any, source: string) {
    return this.readingSource === source && this.readingLanguage === language && this.readingVoice === voice;
  }

  read(language: any, voice: any, source: string) {
    this.stopReading();
    const text = this.getTestText(language);
    this.readingSource = source;
    this.readingLanguage = language;
    this.readingVoiceState = 'loading';
    this.readingVoice = voice;
    this.tts.testTTS(voice, text, 
      () => {
        this.readingVoiceState = 'reading';
      },
      () => {
        this.readingVoiceState = 'none';
        this.readingVoice = null;
      });
  }

  private getTestText(language: string): string {
    switch (language) {
      case 'cs': return "Bylo nebylo, v daleké zemi, kde slunce svítí o něco jasněji, stála malebná vesnička.";
      case 'en': return "Once upon a time, in a faraway land where the sun shines a little brighter, there stood a picturesque village.";
      case 'de': return "Es war einmal, in einem fernen Land, wo die Sonne etwas heller schien, ein malerisches Dorf.";
      case 'sk': return "Kedysi dávno v ďalekej krajine, kde slnko svieti o niečo jasnejšie, stála malebná dedinka.";
      case 'sl': return "Nekoč je v daljni deželi, kjer malo bolj sije sonce, stala slikovita vas.";
      case 'es': return "Érase una vez, en una tierra lejana donde el sol brilla un poco más, había un pueblo pintoresco.";
      case 'fr': return "Il était une fois, dans un pays lointain où le soleil brille un peu plus, se dressait un village pittoresque.";
      case 'pl': return "Dawno, dawno temu, w odległej krainie, gdzie słońce świeci trochę jaśniej, stała malownicza wioska.";
      case 'it': return "C'era una volta, in una terra lontana dove il sole splende un po' più luminoso, sorgeva un pittoresco villaggio.";
      case 'uk': return "Давним-давно в далекій країні, де сонце світить трохи яскравіше, стояло мальовниче село.";
      case 'ru': return "Когда-то в далекой стране, где солнце светит немного ярче, стояла живописная деревня.";
      case 'pt': return "Era uma vez, numa terra distante onde o sol brilha um pouco mais forte, existia uma pitoresca aldeia.";
      case 'lt': return "Kadaise tolimame krašte, kur saulė šviečia kiek ryškiau, stovėjo vaizdingas kaimas.";
      case 'lv': return "Reiz tālā zemē, kur saule spīd nedaudz spožāk, stāvēja gleznains ciemats.";
      case 'zh-CN': return "很久很久以前，在一个阳光普照的遥远国度，有一个风景如画的村庄。";
      case 'zh-TW': return "很久很久以前，在一個陽光普照的遙遠國度，有一個風景如畫的村莊。";
      case 'et': return "Kord oli, kauges maal, kus päike paistab veidi eredamalt, seisid maalilised külad.";
      case 'sv': return "Det var en gång, i ett avlägset land där solen skiner lite ljusare, stod en pittoresk by.";
      case 'hu': return "Volt egyszer, egy távoli országban, ahol a nap egy kicsit fényesebben süt, egy festői falu állt.";
      }
  }
}

