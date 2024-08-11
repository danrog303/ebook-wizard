import environment from "@env/environment";
import EbookProjectIllustration from "@app/models/ebook-project/ebook-project-illustration.model";
import Quill from "quill";

export let ebookProjectIdForQuill = {
    value: ""
};

export let quillInstance = {
    value: null as Quill | null
};

/**
 * This service class is special, because it is designed to not use Angular dependency injection system.
 * This is because it is used in a component (QuillJS editor) that is not part of the Angular application.
 * This component is initialized by QuillJS before Angular is bootstrapped, so it cannot use Angular DI system.
 */
export default class QuillIllustrationService {
    async deleteIllustrationImage(ebookProjectId: string, illustrationHash: string): Promise<Response> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/illustration/${illustrationHash}`;
        return fetch(url, {method: 'DELETE'});
    }

    async getIllustrationImageUrl(ebookProjectId: string, illustrationHash: string): Promise<string> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/illustration/${illustrationHash}`;

        const accessTokenKey = this.findKeyEndingWith('accessToken')!;
        const accessToken = localStorage.getItem(accessTokenKey)!;

        return fetch(url, {method: 'GET', headers: {
            Authorization: `Bearer ${accessToken}`
        }}).then(response => response.text());
    }

    async uploadIllustrationImage(ebookProjectId: string, file: File): Promise<{ url: string, stub: string }> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/illustration`;
        const formData = new FormData();
        formData.append('file', file);

        const accessTokenKey = this.findKeyEndingWith('accessToken')!;
        const accessToken = localStorage.getItem(accessTokenKey)!;

        const illustration: EbookProjectIllustration = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json());

        const imageUrl = await this.getIllustrationImageUrl(ebookProjectId, illustration.stub);

        return {
            url: imageUrl,
            stub: illustration.stub
        };
    }

    handleQuillImageUpload() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files![0];
            const fileB64 = await this.fileToBase64(file);

            const range = quillInstance.value!.getSelection();
            quillInstance.value!.insertEmbed(range!.index, 'image', fileB64, 'user');

            const imageElement = quillInstance.value!.root.querySelector(`img[src="${fileB64}"]`);
            imageElement!.setAttribute('alt', `Illustration uploading`);
            imageElement!.classList.add("image-uploading");

            if (file) {
                this.uploadIllustrationImage(ebookProjectIdForQuill.value, file).then((image) => {
                    imageElement!.classList.remove("image-uploading");
                    imageElement!.setAttribute('src', image.url);
                    imageElement!.setAttribute('alt', `${image.stub}`);
                });
            }
        };
    }

    private findKeyEndingWith(ending: string) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)!;
            if (key.endsWith(ending)) {
                return key;
            }
        }
        return null;
    }

    private fileToBase64(file: File) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}
