$(document).ready(function () {
    // Init new Vue instance
    var app = new Vue({
        el: '#app', // div target
        data: {
            // this is the model we're going to use to render the JSON data, it gets assigned on #searchButton's click event
            verifiedOrg: {
                organization_id: null,
                organization_name: null,
                organization_name_aka: null,
                city: null,
                ein: null,
                foundation_type_description: null,
                charity_check_last_modified: null,

                pub78_organization_name: null,
                pub78_ein: null,
                pub78_verified: null,
                pub78_city: null,
                most_recent_pub78: null,
                most_recent_irb: null,

                bmf_organization_name: null,
                bmf_ein: null,
                most_recent_bmf: null,
                subsection_description: null,
                foundation_509a_status: null
            },
            verifyData: {}
        }
    });

    // init bootstrap tooltip w/ options
    $('[tool-tip-toggle="tooltip-json"]').tooltip({
        placement: 'left'
    });

    // pretty pring JSON in HTML for debugging/examples
    $("#verifyRawJson").on("click", function () {
        $("#rawJson").html(jsonPrettyPrint.toHtml(app.verifyData));
        $("#rawJsonModal").modal("show");
    });

    // hook the enter key as a way to trigger a search
    $("#searchTerms").keyup(function (event) {
        if (event.keyCode === 13) {
            $("#searchButton").click();
        }
    });

    /*
     * Make a GET call using AJAX to our controller, normally the controller would then manipulate and return
     * a DTO for json. Since we want to display the raw JSON I opted to just return the raw JSON instead.
     */
    $("#searchButton").on("click", function (event) {
        $.ajax({
            method: "GET",
            url: "/charitycheck/check",
            data: { ein: $("#searchTerms").val() },
            dataType: "json",
            beforeSend: function () {
                $("#loadingSpinner").show();
            },
            success: function (response) {
                $("#loadingSpinner").hide();

                if (response.code === 200) {
                    app.verifiedOrg = response.data;
                    app.verifyData = response; // used to display our raw JSON response

                    $("#rawJson").html(jsonPrettyPrint.toHtml(response));
                    $("#verifiedOrg").show();
                } else {
                    $("#errorMessage").html(response.message);
                    $("#errorModal").modal("show");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $("#loadingSpinner").hide();
                console.log("Error when doing /api/essentials request");
                console.log(textStatus);
                console.dir(jqXHR);
                console.dir(textStatus);
            }
        });
    });
});