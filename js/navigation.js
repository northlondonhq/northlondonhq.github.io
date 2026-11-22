
const pageLinks = document.querySelectorAll("[data-page]");
const pageSections = document.querySelectorAll("[data-page-section]");

function showPage(pageName, updateAddress = true) {

    const selectedPage = document.querySelector(
        `[data-page-section="${pageName}"]`
    );

    if (!selectedPage) {
        pageName = "dashboard";
    }

    pageSections.forEach(section => {
        const isSelected =
            section.dataset.pageSection === pageName;

        section.hidden = !isSelected;
    });

    pageLinks.forEach(link => {
        const isSelected = link.dataset.page === pageName;

        link.classList.toggle("active", isSelected);
    });

    if (updateAddress) {
        history.replaceState(null, "", "#" + pageName);
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Sidebar navigation

pageLinks.forEach(link => {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        const pageName = this.dataset.page;

        showPage(pageName);

    });

});


// Support browser back and forward buttons

window.addEventListener("hashchange", function() {

    const pageName = window.location.hash.substring(1);

    showPage(pageName || "dashboard", false);

});


// Open the selected page when the website loads

const startingPage =
    window.location.hash.substring(1) || "dashboard";

showPage(startingPage, false);
