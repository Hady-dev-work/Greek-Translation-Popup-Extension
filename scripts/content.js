//debugger;
// applicable links
// https://www.perseus.tufts.edu/hopper/text?doc=value
// https://www.perseus.tufts.edu/hopper/morph?l=tíma&la=non&can=tíma0&prior=ÞANN&d=Perseus:text:2003.02.0007:chapter=1&i=1

// attribute to fetch
// <span class="lemma_definition">
//  only with a negative, t eigi,to be reluctant, grudge (hann tímdi eigi at gefa mönnum sínum mat) ;
// </span>

// attribute containg link example
// <a href="morph?l=v%C3%A1ru&amp;la=non&amp;can=v%C3%A1ru0&amp;prior=fylkiskonungar"
// onclick="m(this,1,0); return false"
// class="text"
// target="morph">váru</a>

// from which definitions are grabbed
const BASE_URL = "https://www.perseus.tufts.edu/hopper/";
// prevent timeout errors or too many requests
let hoverTimeout = null;
// prevent unneccessary fetches of already fetched words
let cache = {};
// popup attribute to add to scene
let popup = null;

// create popup - add to html doc
function createPopup() {
  popup = document.createElement("div");
  popup.id = "popup";
  document.body.appendChild(popup);
}

// show popup
function showPopup(text, x, y) {
  popup.textContent = text;
  popup.style.left = `${x + 10}px`;
  popup.style.top = `${y + 10}px`;
  popup.style.display = "block";
}

// make popup not visible
function hidePopup() {
  popup.style.display = "none";
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }
}

// fetch the words definition or definitions
async function fetchDefinition(href) {
  // if word has already been looked up, return the word
  // through quick caching
  if (cache[href]) {
    return cache[href];
  }

  // fetch content form link
  try {
    const res = await fetch(BASE_URL + href);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    // use res.text() to get html of webpage
    let html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const span_definitions = Array.from(
      doc.querySelectorAll(".lemma_definition")
    );
    // get text contained in span, trim to remove whitespace
    // in case span is empty, remove empty definitions using filter
    const defs = span_definitions
      .map((span) => span.textContent.trim())
      .filter((textContent) => textContent.length > 0);

    // if length non-null/non-zero, return string appended, else return no defs found
    const popUpText = defs.length
      ? defs.map((text, index) => `${index + 1}. ${text}`).join("\n")
      : "No definitions found";

    // cache the text in the cache dictionary
    cache[href] = popUpText;
    return popUpText;
  } catch (error) {
    console.error("Error fetching data:", error);
    return "Error fetching definition";
  }
}

// check if mouse is hovering
function mouseHover() {
  // get all anchor elements of class text where attribute href begins with morph?
  const links = document.querySelectorAll('a.text[href^="morph?"]');

  // add event listener to all links for hover
  links.forEach((link) => {
    link.addEventListener("mouseenter", (mouseEvent) => {
      // get link associated with word
      const href = link.getAttribute("href");
      // get x coordinate of the mouse
      const xCoord = mouseEvent.clientX;
      // get y coordinate of the mouse
      const yCoord = mouseEvent.clientY;

      // delay to avoid timeout
      hoverTimeout = setTimeout(async () => {
        // get the definition of the word through the link
        const definition = await fetchDefinition(href);
        // create popup
        showPopup(definition, xCoord, yCoord);
      }, 1000); // 1000 ms delay
    });
    // add event listener to all links when no longer hovering
    link.addEventListener("mouseleave", hidePopup);
  });
}

// call setup functions upon webpage load
window.addEventListener("load", () => {
  createPopup();
  mouseHover();
});
