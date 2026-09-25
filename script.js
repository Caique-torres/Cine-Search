const API_KEY = "ea976940";

const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const moviesContainer = document.querySelector("#movies");
const message = document.querySelector("#message");

// Modal
const movieModal = document.querySelector("#movieModal");
const closeModal = document.querySelector("#closeModal");

const modalPoster = document.querySelector("#modalPoster");
const modalTitle = document.querySelector("#modalTitle");
const modalYear = document.querySelector("#modalYear");
const modalGenre = document.querySelector("#modalGenre");
const modalPlot = document.querySelector("#modalPlot");


// =========================
// BUSCAR FILMES
// =========================

searchForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const search = searchInput.value.trim();

    if (!search) {
        message.textContent = "Digite o nome de um filme.";
        return;
    }

    message.textContent = "Buscando...";
    moviesContainer.innerHTML = "";

    try {

        const response = await fetch(
            `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(search)}`
        );

        const data = await response.json();

        if (data.Response === "False") {
            message.textContent = data.Error;
            return;
        }

        message.textContent = "";

        mostrarFilmes(data.Search);

    } catch (error) {

        console.error(error);

        message.textContent =
            "Erro ao buscar os filmes.";
    }
});


// =========================
// MOSTRAR FILMES
// =========================

function mostrarFilmes(filmes) {

    moviesContainer.innerHTML = "";

    filmes.forEach((filme) => {

        const card = document.createElement("article");

        card.classList.add("movie");

        card.innerHTML = `
            <img
                src="${
                    filme.Poster !== "N/A"
                        ? filme.Poster
                        : "https://via.placeholder.com/300x450?text=Sem+Imagem"
                }"
                alt="Poster de ${filme.Title}"
            >

            <div class="movie-info">
                <h2>${filme.Title}</h2>
                <p>Ano: ${filme.Year}</p>
                <p>Tipo: ${filme.Type}</p>
            </div>
        `;

        card.addEventListener("click", () => {
            abrirDetalhes(filme.imdbID);
        });

        moviesContainer.appendChild(card);
    });
}


// =========================
// TRADUZIR SINOPSE
// =========================

async function traduzirSinopse(texto) {

    // MyMemory aceita no máximo 500 caracteres.
    // Usamos 450 para evitar ultrapassar o limite.
    const textoParaTraduzir = texto.substring(0, 450);

    const textoCodificado =
        encodeURIComponent(textoParaTraduzir);

    const url =
        `https://api.mymemory.translated.net/get?q=${textoCodificado}&langpair=en|pt-BR`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Erro ao acessar o serviço de tradução.");
    }

    const data = await response.json();

    if (
        !data.responseData ||
        !data.responseData.translatedText
    ) {
        throw new Error("Não foi possível traduzir a sinopse.");
    }

    return data.responseData.translatedText;
}


// =========================
// ABRIR DETALHES
// =========================

async function abrirDetalhes(imdbID) {

    movieModal.classList.add("active");

    modalTitle.textContent = "Carregando...";

    modalYear.textContent = "";

    modalGenre.textContent = "";

    modalPlot.textContent =
        "Buscando informações do filme...";

    try {

        const response = await fetch(
            `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`
        );

        const filme = await response.json();

        if (filme.Response === "False") {

            modalTitle.textContent = "Erro";

            modalPlot.textContent = filme.Error;

            return;
        }


        // Título
        modalTitle.textContent =
            filme.Title;


        // Ano
        modalYear.textContent =
            `Ano: ${filme.Year}`;


        // Gênero
        modalGenre.textContent =
            `Gênero: ${filme.Genre}`;


        // Poster
        modalPoster.src =
            filme.Poster !== "N/A"
                ? filme.Poster
                : "https://via.placeholder.com/300x450?text=Sem+Imagem";

        modalPoster.alt =
            `Poster de ${filme.Title}`;


        // =========================
        // SINOPSE
        // =========================

        if (filme.Plot === "N/A") {

            modalPlot.textContent =
                "Sinopse não disponível.";

            return;
        }


        modalPlot.textContent =
            "Traduzindo sinopse...";


        try {

            const sinopseTraduzida =
                await traduzirSinopse(filme.Plot);

            modalPlot.textContent =
                sinopseTraduzida;

        } catch (error) {

            console.error(
                "Erro na tradução:",
                error
            );

            // Se a tradução falhar,
            // mostra a sinopse original.
            modalPlot.textContent =
                filme.Plot;
        }

    } catch (error) {

        console.error(error);

        modalTitle.textContent =
            "Erro";

        modalPlot.textContent =
            "Não foi possível carregar os detalhes do filme.";
    }
}


// =========================
// FECHAR MODAL
// =========================

closeModal.addEventListener("click", () => {

    movieModal.classList.remove("active");
});


// Fechar clicando fora
movieModal.addEventListener("click", (event) => {

    if (event.target === movieModal) {

        movieModal.classList.remove("active");
    }
});


// Fechar com ESC
document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        movieModal.classList.remove("active");
    }
});
