
function highlightText(element, searchTerm) {
    let text = element.textContent;
    let lowerText = text.toLowerCase();
    let position = 0;
    let index;
    let fragment = document.createDocumentFragment();

    while ((index = lowerText.indexOf(searchTerm, position)) !== -1) {
        fragment.append(
            document.createTextNode(text.slice(position, index))
        );

        let mark = document.createElement("mark");

        mark.textContent = text.slice(index, index + searchTerm.length);
        fragment.append(mark);
        position = index + searchTerm.length;
    }

    fragment.append(
        document.createTextNode(text.slice(position))
    );

    element.replaceChildren(fragment);
}

function searchWebsite() {
    let searchTerm = document.getElementById("search").value.toLowerCase().trim();

    let table = document.getElementById("function_table_content");
    let rows = table.getElementsByTagName("tr");
    let firstMatch = null;
    let matchCount = 0;
    let result = document.getElementById("search_result");
    let oldMarks = table.querySelectorAll("mark");

    oldMarks.forEach(mark => {
        mark.replaceWith(document.createTextNode(mark.textContent));
    });

    for (let i = 1; i < rows.length; i++) {

        let rowText = rows[i].textContent.toLowerCase();

        if (searchTerm !== "" && rowText.includes(searchTerm)) {
            matchCount++;

            if (firstMatch === null) {
                firstMatch = rows[i];
            }

            let cells = rows[i].getElementsByTagName("td");

            for (let j = 0; j < cells.length; j++) {
                highlightText(cells[j], searchTerm);
            }
        }
    }

    if (searchTerm === "") {
        result.textContent = "Bitte Suchbegriff eingeben.";

    } else if (firstMatch === null) {
        result.textContent = "Keine Ergebnisse gefunden.";

    } else {
        result.textContent = matchCount + " Ergebnisse gefunden.";

        firstMatch.scrollIntoView({
            block: "center"
        });
    }
}

function openModal(imgElement) {
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImg");

    modal.style.display = "flex";
    modalImg.src = imgElement.src;
}

function closeModal() {
    const modal = document.getElementById("imgModal");
    modal.style.display = "none";
}

const logo = document.querySelector(".logo-website");

let ticking = false;

function updateLogo() {

    const scrollY = window.scrollY;

    let progress = Math.min(scrollY / 800, 1);

    progress = progress * progress * (3 - 2 * progress);

    const width = 400 + progress * (window.innerWidth - 400);

    const opacity = 1 - (progress * 0.92);

    logo.style.width = width + "px";
    logo.style.opacity = opacity;

    ticking = false;
}

window.addEventListener("scroll", function() {
    if (!ticking) {
        window.requestAnimationFrame(updateLogo);
        ticking = true;
    }
});

window.addEventListener("resize", function() {
    updateLogo();
});

updateLogo();


function fadeIn() {
    console.log("Fade in.");
}

function fadeOut() {
    const element = document.querySelector(".my-text");
    element.classList.add("fade-out");
}








