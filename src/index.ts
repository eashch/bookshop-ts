import "./style.scss";
import "./basic-elements.scss";
import "./header.scss";
import "./main-page.scss";
import "./book.scss";
import "./slider.scss";

import "./booksLoader.ts";
import { BooksLoader } from "./booksLoader";
import {Banner, Slider} from "./slider";
import imgBannerFridaySale from "./images/banner_friday-sale.png";
import imgBannerTop10 from "./images/banner_top-10.png";
import imgBannerCozyBooks from "./images/banner_cozy-books.png";

const booksLoader = new BooksLoader();
const slider = new Slider([
     new Banner(imgBannerFridaySale, "Friday sale"),
     new Banner(imgBannerTop10, "Top 10 books"),
     new Banner(imgBannerCozyBooks, "Cozy books"),
]);