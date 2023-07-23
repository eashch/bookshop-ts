export class Banner {
    src: string;
    alt: string;
    bannerElement: HTMLImageElement | null;
    constructor(src: string, alt: string) {
        this.src = src;
        this.alt = alt;
    }
}

export class Slider {
    private readonly switchTime = 5000;
    private bannerImage: HTMLImageElement | null = null;
    private banners: Banner[];
    private switcher: HTMLDivElement | null = null;
    private currentIndex = 0;
    private switcherInterval: NodeJS.Timer | null;

    constructor(banners: Banner[]) {
        if (banners.length === 0)
            return;
        this.banners = banners;
        this.bannerImage = document.querySelector(".slider__image");

        this.switcher = document.querySelector(".slider__switcher");
        this.banners.forEach((banner: Banner, index: number) => {
            const switcherButton = document.createElement("button");
            switcherButton.classList.add("button");
            switcherButton.classList.add("slider__switcher-button");
            this.switcher.appendChild(switcherButton);
            switcherButton.addEventListener("click", () => {
                this.switchItem(index);
                this.setInterval();
            });
        });
        this.switchItem(0);
        this.setInterval();
    }

    private setInterval(): void {
        if (this.switcherInterval)
            clearInterval(this.switcherInterval);
        this.switcherInterval = setInterval(() => {
            this.switchItem(this.currentIndex + 1);
        }, this.switchTime);
    }

    private switchItem(indexInArray: number): void {
        if (!this.switcher || !this.bannerImage)
            return;
        indexInArray = indexInArray < 0
            ? (this.banners.length - 1)
            : indexInArray;
        indexInArray = indexInArray >= this.banners.length
            ? 0
            : indexInArray;

        this.switcher.children[this.currentIndex].classList.remove(
            "slider__switcher-button_selected");
        this.currentIndex = indexInArray;
        this.bannerImage.src = this.banners[this.currentIndex].src;
        this.bannerImage.alt = this.banners[this.currentIndex].alt;
        this.switcher.children[this.currentIndex].classList.add(
            "slider__switcher-button_selected");
    }
}