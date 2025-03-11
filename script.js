class ImageGallery {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.imageGallery = document.querySelector(".images");
        this.gallery = document.querySelector(".gallery");
        this.search = document.querySelector(".search-bar");
        this.cardBox = document.querySelector(".card-box");
        this.backButton = document.querySelector("#back");
        this.downloadButton = document.querySelector("#download");
        this.searchTerm = "";
        this.perPage = 12;
        this.currentPage = 1;
        this.isLoading = false;

        this.init();
    }

    init() {
        this.addEventListeners();
        this.getImages(`https://api.pexels.com/v1/curated?page=${this.currentPage}&per_page=${this.perPage}`);
    }

    addEventListeners() {
        this.search.addEventListener("keyup", (e) => this.handleSearch(e));
        this.backButton.addEventListener("click", () => this.hideCardBox());
        this.downloadButton.addEventListener("click", (e) => this.downloadImage(e));
    }

    generateImages(images) {
        this.imageGallery.innerHTML += images
            .map((image) => `
                <li class="card" onclick="imageGallery.showImageBox('${image.photographer}', '${image.src.large2x}')">
                    <img src="${image.src.large2x}">
                    <div class="details">
                        <div class="detail-info">
                            <span class="material-symbols-outlined cam">photo_camera</span>
                            <span id="photographer-name">${image.photographer}</span>
                        </div>
                        <button onclick="imageGallery.download('${image.src.large2x}')" id="download"><span class="material-symbols-outlined"> download</span></button>
                    </div>
                </li>
            `)
            .join("");
    }

    showImageBox(name, img) {
        this.cardBox.querySelector("img").src = img;
        this.cardBox.querySelector("#phName").textContent = name;
        this.cardBox.classList.add("show");
        this.downloadButton.setAttribute("data-img", img);
    }

    hideCardBox() {
        this.cardBox.classList.remove("show");
    }

    async getImages(url) {
        if (this.isLoading) return;
        this.isLoading = true;

        document.getElementById("preloader").style.display = "block";

        try {
            const res = await fetch(url, {
                headers: { Authorization: this.apiKey },
            });
            const data = await res.json();
            this.generateImages(data.photos);
            this.observeLastCard();
        } catch (error) {
            console.error(error);
        } finally {
            this.isLoading = false;
            document.getElementById("preloader").style.display = "none";
        }
    }

    observeLastCard() {
        const cards = document.querySelectorAll(".images .card");
        const lastCard = cards[cards.length - 1];
        if (!lastCard) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !this.isLoading) {
                    let apiUrl = `https://api.pexels.com/v1/curated?page=${++this.currentPage}&per_page=${this.perPage}`;
                    apiUrl = this.searchTerm ? `https://api.pexels.com/v1/search?query=${this.searchTerm}&page=${++this.currentPage}&per_page=${this.perPage}` : apiUrl;
                    this.getImages(apiUrl);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(lastCard);
    }

    async downloadImage(e) {
        const imgUrl = e.target.getAttribute("data-img");
        if (!imgUrl) {
            console.error("No image URL found!");
            return;
        }

        try {
            const res = await fetch(imgUrl);
            const blob = await res.blob();
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `image-${new Date().getTime()}`;
            a.click();
        } catch (error) {
            console.error("Download failed:", error);
        }
    }

    async download(imgUrl) {
        if (!imgUrl) {
            console.error("No image URL found!");
            return;
        }

        try {
            const res = await fetch(imgUrl);
            const blob = await res.blob();
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `image-${new Date().getTime()}`;
            a.click();
        } catch (error) {
            console.error("Download failed:", error);
        }
    }

    handleSearch(e) {
        if (e.key === "Enter") {
            if (e.target.value === "") {
                this.getImages(`https://api.pexels.com/v1/curated?page=${this.currentPage}&per_page=${this.perPage}`);
                return;
            }

            this.currentPage = 1;
            this.searchTerm = e.target.value;
            this.imageGallery.innerHTML = "";
            this.getImages(`https://api.pexels.com/v1/search?query=${this.searchTerm}&page=${this.currentPage}&per_page=${this.perPage}`);
        }
    }
}

const imageGallery = new ImageGallery("");// insert your api key here
