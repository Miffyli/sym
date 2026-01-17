export function isElementInViewport(element) {
    if (typeof jQuery === "function" && element instanceof jQuery) {
        element = element[0];
    }
    const rect = element.getBoundingClientRect();
    return (
        rect.bottom > 0 && //not scrolled past
        rect.top <= window.visualViewport.height &&
        rect.right > 0 && //not scrolled past
        rect.left <= window.visualViewport.width
    );
}

export function scrollToElement(element){
    if (typeof jQuery === "function" && element instanceof jQuery) {
        element = element[0];
    }
    if (isElementInViewport($(element))) {
        return;
    }
    element.scrollIntoView();
}