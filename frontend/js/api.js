const api = {
    previewContentUrl: "../../backend/php/main.php?action=getPropertyList",
    numberOfHouses: 8,
    openCageKeyUrl: "../../backend/php/main.php?action=getOpenCageKey",

    getPreviewContent: function (currentPage) {
        let numberOfHouses = this.numberOfHouses;
        const startingPoint = (currentPage - 1) * numberOfHouses;
        return $.ajax({
            url: this.previewContentUrl,
            method: "GET",
            data: { numberOfHouses, startingPoint },
            dataType: "json"
        });
    },

    getOpenCageLeafletKey: async function () {
        return $.ajax({
            url: this.openCageKeyUrl,
            method: "GET",
            dataType: "text"
        });
    }
};