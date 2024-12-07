import {Component, Input, OnInit} from '@angular/core';
import MaterialModule from "@app/modules/material.module";
import {CommonModule} from "@angular/common";
import {AudiobookService} from "@app/services/audiobook.service";
import {firstValueFrom} from "rxjs";
import NotificationService from "@app/services/notification.service";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import {MatSlider, MatSliderThumb} from "@angular/material/slider";
import {FormsModule} from "@angular/forms";
import AuthenticationService from "@app/services/authentication.service";
import {RouterLink} from "@angular/router";

export interface AudiobookMenuContext {
    openNextPage: () => Promise<void>;
    isNextPageAvailable: () => boolean;
    getCurrentText: () => Promise<string>;
}

@Component({
    selector: 'app-audiobook-menu',
    standalone: true,
    imports: [MaterialModule, CommonModule, MatSlider, MatSliderThumb, FormsModule, RouterLink],
    templateUrl: './audiobook-menu.component.html',
    styleUrl: './audiobook-menu.component.scss'
})
export class AudiobookMenuComponent implements OnInit {
    audioPlaybackOn = false;
    audioPlaybackPaused = false;

    autoChangePages = true;
    supportedLanguages: string[] = [];
    supportedVoices: string[] = [];
    chosenLanguage: string = '';
    chosenVoice: string = '';
    chosenVolumePercentage: number = 25;
    audiobookServiceAvailable = false;

    protected loadingLanguagesList: LoadingStatus = LoadingStatus.NOT_STARTED;
    protected loadingVoicesList: LoadingStatus = LoadingStatus.NOT_STARTED;

    @Input() context: AudiobookMenuContext | null = null;
    private audioUrl: string | null = null;
    private readonly audioPlayer: HTMLAudioElement = new Audio();

    constructor(private readonly audiobookService: AudiobookService,
                private readonly notificationService: NotificationService,
                private readonly authService: AuthenticationService) {}

    async ngOnInit() {
        const isAuthenticated = await this.authService.isUserAuthenticated();

        if (isAuthenticated) {
            this.audiobookServiceAvailable = true;
            await this.fetchLanguages();
            await this.fetchVoicesForCurrentLanguage();
        } else {
            this.audiobookServiceAvailable = false;
        }
    }

    async fetchLanguages() {
        try {
            this.audiobookServiceAvailable = true;
            this.loadingLanguagesList = LoadingStatus.LOADING;
            this.supportedLanguages = await firstValueFrom(this.audiobookService.getSupportedLanguages());
            this.chosenLanguage = this.getDefaultLanguage();
            this.loadingLanguagesList = LoadingStatus.LOADED;
        } catch (e) {
            if (JSON.stringify(e).includes("403") || JSON.stringify(e).includes("401")) {
                this.audiobookServiceAvailable = false;
            } else {
                this.notificationService.show($localize`Failed to load audiobook data. Please try again later.`);
            }
            this.loadingLanguagesList = LoadingStatus.ERROR;
        }
    }

    async fetchVoicesForCurrentLanguage() {
        try {
            this.loadingVoicesList = LoadingStatus.LOADING;
            this.supportedVoices = await firstValueFrom(this.audiobookService.getVoicesForLanguage(this.chosenLanguage));
            this.chosenVoice = this.supportedVoices[0];
            this.loadingVoicesList = LoadingStatus.LOADED;
        } catch {
            this.notificationService.show($localize`Failed to load audiobook data. Please try again later.`);
            this.loadingVoicesList = LoadingStatus.ERROR;
        }
    }

    getDefaultLanguage(): string {
        const cachedLanguage = localStorage.getItem("audiobookLanguage");
        if (cachedLanguage && this.supportedLanguages.includes(cachedLanguage)) {
            return cachedLanguage;
        }

        localStorage.setItem("audiobookLanguage", "pl-PL");
        return "pl-PL";
    }

    getLanguageName(languageCode: string): string {
        return this.audiobookService.mapLanguageCodeToName(languageCode);
    }

    async onLanguageUpdated(newValue: string) {
        localStorage.setItem("audiobookLanguage", newValue);
        this.chosenLanguage = newValue;
        await this.fetchVoicesForCurrentLanguage();
    }

    async playAudio() {
        const pageText = await this.context?.getCurrentText()!;
        const blob = await firstValueFrom(this.audiobookService.synthesizeSpeech(this.chosenVoice, pageText));
        if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl);
        }
        this.audioUrl = URL.createObjectURL(blob);


        this.audioPlayer.src = this.audioUrl;
        this.audioPlayer.volume = this.chosenVolumePercentage / 100;
        this.audioPlayer.load();
        await this.audioPlayer.play();
        this.audioPlaybackPaused = false;
        this.audioPlaybackOn = true;
        this.audioPlayer.onended = this.onAudioEnded.bind(this);
    }

    async stopAudio() {
        this.audioPlayer.pause();
        this.audioPlayer.onended = null;
        this.audioPlaybackOn = false;
        this.audioPlaybackPaused = false;
    }

    async onAudioEnded() {
        if (!this.autoChangePages) {
            this.audioPlaybackOn = false;
            return;
        }

        if (this.context?.isNextPageAvailable()) {
            await this.context.openNextPage();
            await this.playAudio();
        } else {
            this.audioPlaybackOn = false;
        }
    }

    async toggleAudio() {
        if (!this.audioPlaybackOn) {
            await this.playAudio();
        } else {
            await this.stopAudio();
        }
    }

    async onVolumeChanged(newValue: number) {
        this.chosenVolumePercentage = newValue;
        this.audioPlayer.volume = newValue / 100;
    }

    menuEditable(): boolean {
        if (this.loadingLanguagesList !== LoadingStatus.LOADED || this.loadingVoicesList !== LoadingStatus.LOADED) {
            return false;
        }

        if (this.audioPlaybackOn) {
            return false;
        }

        return true;
    }

    protected readonly formatVolumeLabel = (num: number) => `${num}%`;
    protected readonly LoadingStatus = LoadingStatus as any;

    async pauseAudio() {
        this.audioPlayer.pause();
        this.audioPlaybackPaused = true;
    }

    async unpauseAudio() {
        await this.audioPlayer.play();
        this.audioPlaybackPaused = false;
    }
}
