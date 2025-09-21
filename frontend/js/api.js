const api = {
    previewContentUrl: "../../backend/php/list_properties.php",
    numberOfHouses: 8,
    openCageKeyUrl: "../../backend/php/get_open_cage_key.php",

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

    getOpenCageLeafletKey: function () {
        return $.ajax({
            url: this.openCageKeyUrl,
            method: "GET",
            dataType: "text"
        });
    }
};