const searchInput = document.getElementById("search");
const suggestionsElement = document.getElementById("suggestions");
const selectedAdversariesElement = document.getElementById("selected-adversaries");
const clearSelectionButton = document.getElementById("clear-selection");

function valueOrEmpty(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
}

function formatText(value) {
    return valueOrEmpty(value)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/_(.+?)_/g, "<em>$1</em>");
}

function getBattlePoints(type) {
    const normalizedType = valueOrEmpty(type).toLowerCase().trim();
    if (normalizedType === "minion") {
        return "(1 battle point for a group equal to party size)";
    }

    if (
        normalizedType === "social" ||
        normalizedType === "support"
    ) {
        return "(1 battlepoint)";
    }

    if (
        normalizedType.startsWith("horde") ||
        normalizedType === "ranged" ||
        normalizedType === "skulk" ||
        normalizedType === "standard"
    ) {
        return "(2 battlepoints)";
    }

    if (normalizedType === "leader") {
        return "(3 battlepoints)";
    }

    if (normalizedType === "bruiser") {
        return "(4 battlepoints)";
    }

    if (normalizedType === "solo") {
        return "(5 battlepoints)";
    }

    return "";
}

function createMarkBoxes(value) {
    const stringValue = valueOrEmpty(value).trim();
    if (!/^\d+$/.test(stringValue)) {
        return "";
    }
    const count = Number.parseInt(stringValue, 10);
    let html = "";
    for (let i = 0; i < count; i++) {
        html += '<span class="markbox">&nbsp;</span>';
    }

    return html;
}

function createAdversaryStatblock(entry) {
    const statblock = document.createElement("div");
    statblock.className = "adversary-statblock";
    const features = Array.isArray(entry.feature) ? entry.feature : [];

    const featuresHTML = features.map(feature => {
        return `
            <div class="feature">
                <span class="label">${formatText(feature.name)}</span>
                <span class="text">${formatText(feature.text)}</span>
            </div>
        `;
    })
    .join("");

    statblock.innerHTML = `
        <h1 class="name">${formatText(entry.name)}</h1>
        <div class="tier-type">
            <span class="tier">Tier ${formatText(entry.tier)}</span>
            <span class="type">${formatText(entry.type)}</span>
            <span class="battlepoints">${getBattlePoints(entry.type)}</span>
        </div>
        <div class="description">
            <span class="label">Description</span>
            <span class="text">${formatText(entry.description)}</span>
        </div>
        <div class="motives_and_tactics">
            <span class="label">Motives &amp; Tactics</span>
            <span class="text">${formatText(entry.motives_and_tactics)}</span>
        </div>
        <div class="stats">
            <div class="attack">
                <span class="label">Attack</span>
                <span class="text">
                    ${formatText(entry.attack)}:
                    ${formatText(entry.range)}
                    -
                    ${formatText(entry.damage)}
                </span>
            </div>
            <div class="atk">
                <span class="label">ATK</span>
                <span class="text">${formatText(entry.atk)}</span>
            </div>
            <div class="difficulty">
                <span class="label">Difficulty</span>
                <span class="text">${formatText(entry.difficulty)}</span>
            </div>
            <div class="thresholds">
                <span class="label">Thresholds</span>
                <span class="text">${formatText(entry.thresholds)}</span>
            </div>
            <div class="stress">
                <span class="label">Stress</span>
                <span class="text">${formatText(entry.stress)}</span>
                <span class="markboxes">${createMarkBoxes(entry.stress)}</span>
            </div>
            <div class="hp">
                <span class="label">HP</span>
                <span class="text">${formatText(entry.hp)}</span>
                <span class="markboxes">${createMarkBoxes(entry.hp)}</span>
            </div>
        </div>
        <div class="experience">
            <span class="label">Experiences</span>
            <span class="text">${formatText(entry.experience)}</span>
        </div>
        <div class="features">${featuresHTML}</div>
    `;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-adversary screen-only";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", `Remove ${valueOrEmpty(entry.name)}`);
    removeButton.addEventListener("click", () => { statblock.remove(); });
    statblock.append(removeButton);

    return statblock;
}

function addAdversary(entry) {
    const statblock = createAdversaryStatblock(entry);
    selectedAdversariesElement.append(statblock);
    searchInput.value = "";
    suggestionsElement.replaceChildren();
}

function updateSuggestions() {
    const query = searchInput.value.trim().toLowerCase();
    suggestionsElement.replaceChildren();
    const matches = adversaries
        .filter(entry => {
            if (query === "") {
                return true;
            }
            return valueOrEmpty(entry.name).toLowerCase().includes(query);
        })
        .sort((a, b) => valueOrEmpty(a.name).localeCompare(valueOrEmpty(b.name)));

    for (const entry of matches) {
        const listItem = document.createElement("li");
        const button = document.createElement("button");

        button.type = "button";
        button.textContent =
            `${valueOrEmpty(entry.name)} — Tier ${valueOrEmpty(entry.tier)} ${valueOrEmpty(entry.type)} - ${getBattlePoints(entry.type)}`;
        button.addEventListener("click", () => addAdversary(entry) );

        listItem.append(button);
        suggestionsElement.append(listItem);
    }
}

searchInput.addEventListener("input", updateSuggestions);
searchInput.addEventListener("focus", updateSuggestions);

searchInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Escape") {
            searchInput.value = "";
            suggestionsElement.replaceChildren();
        }
    }
);

clearSelectionButton.addEventListener(
    "click",
    () => {
        selectedAdversariesElement.replaceChildren();
        searchInput.focus();
    }
);

document.addEventListener("click", event => {
    const clickedInsideSearch = document.getElementById("search-area").contains(event.target);

    if (!clickedInsideSearch) {
        suggestionsElement.replaceChildren();
    }
});
