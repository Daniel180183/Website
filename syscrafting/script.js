
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

let currentZoom = 1;

function openModal(imgElement) {
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImg");

    currentZoom = 1;

    modal.style.display = "flex";
    modalImg.src = imgElement.src;
    modalImg.style.setProperty("--zoom", 1);
}

function closeModal() {
    const modal = document.getElementById("imgModal");
    modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function() {

    document.getElementById("imgModal").addEventListener("wheel", function(event) {

        event.preventDefault();

        console.log("Mausrad erkannt:", event.deltaY);

        if (event.deltaY < 0) {
            currentZoom += 0.1;
        } else {
            currentZoom -= 0.1;
        }

        currentZoom = Math.max(0.5, Math.min(currentZoom, 4));

        const modalImg = document.getElementById("modalImg");

        modalImg.style.setProperty("--zoom", currentZoom);

    }, { passive: false });

});

let ticking = false;

function updateLogo() {
    const logo = document.querySelector(".logo-website");

    if (!logo) {
        return;
    }

    const scrollY = window.scrollY;

    const startWidth = Math.min(
        400,
        Math.max(280, window.innerWidth * 0.20833)
    );

    let progress = Math.min(scrollY / 800, 1);

    progress = progress * progress * (3 - 2 * progress);

    let opacityProgress = Math.min(scrollY / 200, 1);
    opacityProgress = opacityProgress * opacityProgress * (3 - 2 * opacityProgress);
    const opacity = 1 - (opacityProgress * 0.92);

    const width = startWidth + progress * (window.innerWidth - startWidth);

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

function hideFadeIn() {
    const element = document.documentElement;
    element.classList.add("hide");

    setTimeout(() => {
        element.classList.remove("fade-out");
        element.classList.remove("hide");
        element.classList.add("fade-in");
    }, 1);
}

function fadeOutCallIpt() {
    const element = document.documentElement;
    element.classList.remove("fade-out");
    element.classList.remove("hide");
    element.classList.add("fade-out");

    setTimeout(() => {
        window.location.href = "ipt.html";
    }, 500);
}

function fadeOutCallIndex() {
    const element = document.documentElement;
    element.classList.remove("fade-out");
    element.classList.remove("hide");
    element.classList.add("fade-out");

    setTimeout(() => {
        window.location.href = "index.html";
    }, 500);
}

function fadeOutCallDownloads() {
    const element = document.documentElement;
    element.classList.remove("fade-out");
    element.classList.remove("hide");
    element.classList.add("fade-out");

    setTimeout(() => {
        window.location.href = "downloads.html";
    }, 500);
}

async function animateDownloadLink(event) {
    const link = event.currentTarget;

    const downloadUrl = link.dataset.url;
    const fileName = link.dataset.filename;

    // Verhindert mehrfaches Starten.
    if (link.classList.contains("animate")) {
        return;
    }

    const progressFill = link.querySelector(".download-progress-fill");
    const cancelButton = link.parentElement.querySelector(".download-cancel");

    // Eigenen AbortController für diesen Download erstellen.
    const controller = new AbortController();

    // Fortschrittsbalken zurücksetzen.
    progressFill.style.width = "0%";

    link.classList.remove("reset");
    link.classList.add("animate");

    try {
        // Pfeilanimation: 1350 ms, aber abbrechbar.
        await waitWithSignal(1350, controller.signal);

        // Abbrechen-Button einblenden.
        cancelButton.hidden = false;
        cancelButton.onclick = () => controller.abort();

        // Download anfordern.
        const response = await fetch(downloadUrl, {
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error("Download konnte nicht gestartet werden.");
        }

        // Gesamtgröße der Datei ermitteln.
        const totalSize = Number(response.headers.get("Content-Length"));

        // Datenstrom lesen.
        const reader = response.body.getReader();

        let receivedSize = 0;
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            chunks.push(value);
            receivedSize += value.length;

            // Fortschritt berechnen.
            if (totalSize > 0) {
                const progress = Math.min(
                    (receivedSize / totalSize) * 100,
                                          100
                );

                progressFill.style.width = progress + "%";

                await new Promise(resolve => {
                    requestAnimationFrame(() => resolve());
                });
            }
        }

        // Download ist vollständig übertragen.
        cancelButton.hidden = true;
        cancelButton.onclick = null;

        // Datei zusammensetzen.
        const blob = new Blob(chunks, {
            type: "application/gzip"
        });

        // Download im Browser auslösen.
        const url = URL.createObjectURL(blob);
        const download = document.createElement("a");

        download.href = url;
        download.download = fileName;

        document.body.appendChild(download);
        download.click();
        download.remove();

        URL.revokeObjectURL(url);

        // Download vollständig anzeigen.
        progressFill.style.width = "100%";

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Animation vollständig entfernen.
        link.classList.remove("animate");
        link.classList.remove("reset");

        progressFill.style.width = "0%";

        // Rahmen wieder sichtbar machen.
        link.classList.add("finished");

        await new Promise(resolve => setTimeout(resolve, 400));

        link.classList.remove("finished");

    } catch (error) {

        if (error.name === "AbortError") {
            console.log("Download wurde abgebrochen.");

            // Animation zurücksetzen.
            link.classList.remove("animate");
            link.classList.remove("reset");
            link.classList.remove("finished");

            progressFill.style.width = "0%";

        } else {
            console.error("Downloadfehler:", error);
            alert("Der Download konnte nicht durchgeführt werden.");
        }

    } finally {
        // Abbrechen-Button wieder entfernen.
        cancelButton.hidden = true;
        cancelButton.onclick = null;
    }
}

function switchSiteStartDownloadTq() {
    sessionStorage.removeItem("continueSwitchSiteStartDownloadTq");
    sessionStorage.setItem("continueSwitchSiteStartDownloadTq", "true");

    fadeOutCallDownloads();
}

function switchSiteStartDownloadIpt() {
    sessionStorage.removeItem("continueSwitchSiteStartDownloadIpt");
    sessionStorage.setItem("continueSwitchSiteStartDownloadIpt", "true");

    fadeOutCallDownloads();
}

function waitWithSignal(ms, signal) {
    return new Promise((resolve, reject) => {
        if (signal.aborted) {
            reject(new DOMException("Abgebrochen", "AbortError"));
            return;
        }

        const timeout = setTimeout(() => {
            signal.removeEventListener("abort", abort);
            resolve();
        }, ms);

        function abort() {
            clearTimeout(timeout);
            reject(new DOMException("Abgebrochen", "AbortError"));
        }

        signal.addEventListener("abort", abort, { once: true });
    });
}







