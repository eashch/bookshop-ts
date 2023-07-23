import imgBookFiller from "./images/book_filler.png";


class BookCategory {
    name: string;
    apiName: string;
    constructor(name: string, apiName: string) {
        this.name = name;
        this.apiName = apiName;
    }
}

interface BookInfoGoogleBooksAPI {
    id: string;
    volumeInfo: {
        title: string;
        authors: string[];
        description: string;
        imageLinks: {
            thumbnail: string;
        }
        averageRating: number;
        ratingsCount: number;
    }
    saleInfo: {
        retailPrice: {
            amount: number,
            currencyCode: string
        }
    }
}

export class BooksLoader {
    private readonly booksToLoad = 6;
    private readonly menuCategories: BookCategory[] = [
        new BookCategory("Architecture", "Architecture"), 
        new BookCategory("Art & Fashion", "Art"), 
        new BookCategory("Biography", "Biography & Autobiography"), 
        new BookCategory("Business", "Business"), 
        new BookCategory("Crafts & Hobbies", "Crafts & Hobbies"),
        new BookCategory("Drama", "Drama"),
        new BookCategory("Fiction", "Fiction"),
        new BookCategory("Food & Drink", "Cooking"),
        new BookCategory("Health & Wellbeing", "Health & Fitness"),
        new BookCategory("History & Politics", "History"),
        new BookCategory("Humor", "Humor"),
        new BookCategory("Poetry", "Poetry"),
        new BookCategory("Psychology", "Psychology"),
        new BookCategory("Science", "Science"),
        new BookCategory("Technology", "Technology"),
        new BookCategory("Travel & Maps", "Travel"),
        ];

    private readonly apiKey = "AIzaSyAyRUo96941ufs07Vaq16w2SNpI3YkAUg4";
    private readonly localStorageKey = "books-in-cart";
    private booksContainer: HTMLElement | null = null;
    private currentIndex = 0;
    private contentMenu: HTMLDivElement | null;
    private booksInCart: Map<string, BookInfoGoogleBooksAPI>;
    private booksInCartCounter: HTMLDivElement | null;

    private readonly charLimitDescription = 97;
    private readonly charLimitAuthors = 40;
    private readonly charLimitTitle = 40;


    constructor() {
        this.booksInCart = new Map<string, BookInfoGoogleBooksAPI>();
        this.booksInCartCounter = document.querySelector(".books-counter");
        this.loadFromLocalStorage();
        this.booksContainer = document.querySelector(".books-container");
        const loadMoreButton: HTMLButtonElement 
            = document.querySelector(".content__button-load-more");
        loadMoreButton.addEventListener("click", () => this.requestBooks());
        this.contentMenu = <HTMLDivElement>document.querySelector(".content-menu");

        const menuButtonMobile: HTMLButtonElement 
            = document.querySelector(".content-menu__button-open-mobile");
        menuButtonMobile.addEventListener("click", () => {
            this.contentMenu.style.display = this.contentMenu.style.display 
                === "flex" ? "none" : "flex";
        });
        
        const mql: MediaQueryList = window.matchMedia("(max-width: 1400px)");
        mql.addEventListener("change", mediaQueryList => {
            if (mediaQueryList.matches) {
                this.contentMenu.style.display = "none";
            } else {
                this.contentMenu.style.display = "flex";
            }
        });

        
        this.menuCategories.forEach((element: BookCategory, index: number) => {
            const categoryItem: HTMLElement 
                = document.createElement("a");
            categoryItem.classList.add("link");
            categoryItem.classList.add("content-menu__option");
            categoryItem.addEventListener("click", () => {
                this.switchItem(index);
            });
            const categoryItemIndicator: HTMLElement 
                = document.createElement("div");
            categoryItemIndicator.classList.add("content-menu__option-indicator");
            categoryItem.appendChild(categoryItemIndicator);
            categoryItem.innerHTML += element.name;
            this.contentMenu.appendChild(categoryItem);
        });
        this.switchItem(0);
    }

    private switchItem(indexInArray: number): void {
        if (!this.contentMenu 
            || this.contentMenu.children.length === 0)
            return;
        indexInArray = indexInArray < 0
            ? (this.contentMenu.children.length - 1)
            : indexInArray;
        indexInArray = indexInArray >= this.contentMenu.children.length
            ? 0
            : indexInArray;

        const menuItem: HTMLElement 
            = <HTMLElement>this.contentMenu.children[this.currentIndex];
        menuItem.classList.remove(
            "content-menu__option_selected");
        (<HTMLElement>menuItem.children[0]).style.visibility = "hidden";
        if (this.currentIndex != indexInArray)
            this.clearBooks();
        this.currentIndex = indexInArray;
        const menuItemNew = <HTMLElement>this.contentMenu.children[this.currentIndex];
        menuItemNew.classList.add(
            "content-menu__option_selected");
        (<HTMLElement>menuItemNew.children[0]).style.visibility = "visible";
        this.requestBooks();
    }

    private requestBooks(): void {
        const category: BookCategory = this.menuCategories[this.currentIndex];
        const currentNumberOfBooks: number = this.booksContainer.children.length;
        fetch(`https://www.googleapis.com/books/v1/volumes?q="subject:${category.apiName}"&key=${this.apiKey}&printType=books&startIndex=${currentNumberOfBooks}&maxResults=${this.booksToLoad}&langRestrict=en&gl=us`)
            .then(response => response.json())
            .then(result => {
                if (!result || !result.items)
                    return;
                result.items.forEach((bookInfo: BookInfoGoogleBooksAPI) => {
                    this.createBookElement(bookInfo);
                });
            });
    }

    private clearBooks(): void {
        if (this.booksContainer) {
            this.booksContainer.innerHTML = "";
        }
    }

    private createBookElement(bookInfo: BookInfoGoogleBooksAPI): void {
        const newBook: HTMLDivElement = document.createElement("div");
        this.booksContainer.appendChild(newBook);

        const imageLink: string = bookInfo.volumeInfo.imageLinks?.thumbnail 
            ? bookInfo.volumeInfo.imageLinks.thumbnail : imgBookFiller;
        const price: string = this.getPrice(bookInfo);
        const reviews: number = bookInfo.volumeInfo.ratingsCount 
            ? bookInfo.volumeInfo.ratingsCount : 0;
        let authors: string = bookInfo.volumeInfo.authors 
            ? bookInfo.volumeInfo.authors.join(", ") : "";

        const checkAndCutByCharNum = (str: string, numOfChars: number): string => {
            if (str === undefined)
                return "";
            return str.length < numOfChars
                ? str : str.slice(0, numOfChars - 3) + "...";
        };

        authors = checkAndCutByCharNum(
            authors,
            this.charLimitAuthors);
        const title: string = checkAndCutByCharNum(
            bookInfo.volumeInfo.title,
            this.charLimitTitle);
        const description: string = checkAndCutByCharNum(
            bookInfo.volumeInfo.description, 
            this.charLimitDescription);
        

        const bookHTMLContent: string = String.raw`
            <img class="book__image" src="${imageLink}" alt="Book cover" width="212px" height="300px">
            <div class="book-description">
                <span class="text-description book-description__author ellipsis">${authors}</span>
                <h3 class="book-description__title ellipsis">${title}</h3>
                <div class="rating">
                    <div class="rating__stars">
                        <div class="rating__stars_rating">
                        </div>
                    </div>
                    <span class="text-description rating__reviews-number">
                        ${reviews} reviews
                    </span>
                </div>
                <p class="text-description book-description__description ellipsis">
                    ${description}
                </p>
                <span class="text book-description__price">
                    ${price}
                </span>
                <button class="button_with-text book-description__button-buy">
                    Buy now
                </button>
            </div>`;

        newBook.classList.add("book");
        newBook.innerHTML = bookHTMLContent;

        const ratingStars: HTMLElement = newBook.querySelector(".rating__stars_rating");
        const starWidth = 12;
        ratingStars.style.width = ((bookInfo.volumeInfo.averageRating 
            ? bookInfo.volumeInfo.averageRating : 0) * starWidth) + "px";
        
        const buttonBuyNow: HTMLButtonElement = newBook.querySelector(".book-description__button-buy");
        buttonBuyNow.addEventListener("click", () => {
            if (this.booksInCart.has(bookInfo.id)) {
                buttonBuyNow.classList.remove("book-description__button-buy_in-cart");
                this.booksInCart.delete(bookInfo.id);
                buttonBuyNow.innerText = "Buy now";
                this.saveToLocalStorage();
            } else {
                buttonBuyNow.classList.add("book-description__button-buy_in-cart");
                this.booksInCart.set(bookInfo.id, bookInfo);
                buttonBuyNow.innerText = "In the cart";
                this.saveToLocalStorage();
            }
            this.setBooksInCartCounter();
        });

        if (this.booksInCart.has(bookInfo.id)) {
            buttonBuyNow.classList.add("book-description__button-buy_in-cart");
            buttonBuyNow.innerText = "In the cart";
        }
    }

    private saveToLocalStorage(): void {
        const serializedObj = Object.fromEntries(this.booksInCart);
        localStorage.setItem(this.localStorageKey, 
            JSON.stringify(serializedObj));
    }

    private loadFromLocalStorage(): void {
        const booksInCartJSON: string = localStorage.getItem(this.localStorageKey);
        if (booksInCartJSON) {
            this.booksInCart = new Map(Object.entries(
                JSON.parse(booksInCartJSON)));
        }
        this.setBooksInCartCounter();        
    }

    private setBooksInCartCounter(): void {
        this.booksInCartCounter.style.display 
            = this.booksInCart.size > 0 ? "block" : "none";
        this.booksInCartCounter.innerText
            = this.booksInCart.size.toString();
    }

    private getPrice(book: BookInfoGoogleBooksAPI): string {
        if (!book.saleInfo.retailPrice 
            || !book.saleInfo.retailPrice.amount
            || !book.saleInfo.retailPrice.currencyCode)
            return "";
        return (this.currencyCodeToSymbol(book.saleInfo.retailPrice.currencyCode)) 
                + book.saleInfo.retailPrice.amount;
    }

    private currencyCodeToSymbol(currencyCode: string): string {
        const currencySymbols = {
            USD: '$',
            EUR: '€',
            CRC: '₡', 
            GBP: '£',
            ILS: '₪',
            INR: '₹',
            JPY: '¥',
            KRW: '₩',
            NGN: '₦',
            PHP: '₱',
            PLN: 'zł',
            PYG: '₲',
            THB: '฿',
            UAH: '₴',
            VND: '₫',
        };

        type ObjectKey = keyof typeof currencySymbols;
        return currencySymbols[currencyCode as ObjectKey] === undefined 
            ? "" : currencySymbols[currencyCode as ObjectKey];
    }
}