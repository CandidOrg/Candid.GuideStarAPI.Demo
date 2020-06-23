var vueapp;
$(function () {
  // init new Vue instance
  var app = new Vue({
    el: '#app',
    filters: {
      json: (value) => { return JSON.stringify(value, null, 2) }
    },
    data: {
      // declare our models for rendering to Vue
      tableData: null,
      currentOrg: { organization_name: null, ein: null, mission: null, city: null, website: null },
      verifiedOrg: {
        organization_id: null,
        organization_name: null,
        organization_name_aka: null,
        city: null,
        state: null,
        address_line_1: null,
        address_line_2: null,
        contact_phone: null,
        ein: null,
        subsection_description: null,
        charity_check_last_modified: null,

        pub78_organization_name: null,
        pub78_ein: null,
        pub78_verified: null,
        pub78_city: null,
        most_recent_pub78: null,
        most_recent_irb: null,

        bmf_organization_name: null,
        bmf_ein: null,
        bmf_status: null,
        most_recent_bmf: null,
        foundation_509a_status: null
      },
      searchJson: {},
      verifyJson: {}
    },
    watch: {
      // in Vue, the watch methods are triggered when coresponding data changes
      // in this case, always clear the datatable before loading new data
      tableData: function (data) {
        searchResults.clear().rows.add(data).draw();
      }
    }
  });

  // init our datatables to hold the search results
  var searchResults = $("#searchResults").DataTable({
    dom: "<'row'<'col-md-12'i <'dttooltip'>>>" +
      "<'row'<'col-md-12'tr>>" +
      "<'row'<'col-md-12'p>>",
    data: app.tableData,
    autowidth: true,
    // declare what part of the results we want to display
    columns: [
      { data: 'organization_name' },
      { data: 'ein' },
      { data: 'state' },
      { data: 'form990_total_revenue'},
      { data: 'mission' }
    ],
    // options to style and sort
    columnDefs: [
      { "width": "30%", "targets": 0 },
      { "width": "15%", "targets": 1 },
      { "bSortable": false, "width": "10%", "targets": 2 },
      { "width": "10%", "render": $.fn.dataTable.render.number(',', '.', 0, '$'), "targets": 3 },
      { "bSortable": false, "render": $.fn.dataTable.render.ellipsis(140, true), "targets": 4 }
    ],
    aaSorting: []
  });

  // adding tool tip to the datatable dom
  $("div.dttooltip")
      .append('<i id="searchRawJson" class="material-icons" style="float:right;" aria-hidden="true" tool-tip-toggle="tooltip-json" data-original-title="This data is generated from the Essentials API. Click to view the data!">info</i>');

  // expand org info
  $("#searchResults").on("click", "tr", function (event) {
    var selectedOrgEin = event.currentTarget.children[1].innerText;
    if (selectedOrgEin === "EIN") return;

    var selectedOrgInfo = app.tableData.filter(function (obj) {
      return obj.ein === selectedOrgEin;
    })[0];
    console.log("selectedOrgInfo");
    console.dir(selectedOrgInfo);
    if (selectedOrgInfo !== null) {
      app.currentOrg = selectedOrgInfo;
      $("#detailedInfo").modal("show");
    }
  });

  // hook enter key to trigger search
  $("#searchTerms").keyup(function (event) {
    if (event.keyCode === 13) {
      $("#searchButton").click();
    }
  });

  /*
   * Make a GET call using AJAX to our controller, normally the controller would then manipulate and return
   * a DTO for json. Since we want to display the raw JSON I opted to just return the raw JSON instead.
   */
  $("#verifyOrg").on("click", function (event) {
    $.ajax({
      method: "GET",
      url: "/charitycheck/check",
      data: { ein: app.currentOrg.ein },
      dataType: "json",
      beforeSend: function () {
        $("#loadingSpinner").show();
      },
      success: function (response) {
        $("#loadingSpinner").hide();

        app.verifiedOrg = response.data;
        app.verifyJson = response; // used to display our raw JSON response

        $("#verifiedOrg").modal("show");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#loadingSpinner").hide();
        console.log("Error when doing /api/search request");
        console.log(textStatus);
        console.dir(jqXHR);
        console.dir(textStatus);
      }
    });
  });

  // init bootstrap tooltips 
  $('[tool-tip-toggle="tooltip-json"]').tooltip({
    placement: 'left'
  });
  $('[data-toggle="tooltip"]').tooltip();

  // display raw json
  $("#searchRawJson").on("click", function () {
    $("#rawJson").html(jsonPrettyPrint.toHtml(app.searchJson));
    $("#rawJsonModal").modal("show");
  });
  $("#verifyRawJson").on("click", function () {
    $("#rawJson").html(jsonPrettyPrint.toHtml(app.verifyJson));
    $("#rawJsonModal").modal("show");
  });

  // multiple choice dropdowns using multiselect lib
  $("#inputState").multiselect({
    numberDisplayed: 5,
    maxHeight: 200,
    buttonWidth: '100%'
  });

  $("#inputLevel").multiselect({
    maxHeight: 200,
    buttonWidth: '100%'
  });

  $("#inputNtee").multiselect({
    maxHeight: 200,
    buttonWidth: '100%'
  });
  vueapp = app;
});

function showLoadingSpinner() {
  $("#loadingSpinner").show();
}

function updateTable(xhr) {
  $("#loadingSpinner").hide();

  var response = JSON.parse(xhr);

  if (response.code === 200) {
    // prevent datatable from breaking
    vueapp.tableData = response.data.total_hits > 0 ? response.data.hits : [];
    vueapp.searchJson = response; // used to display our raw JSON response
  } else {
    $("#errorMessage").html(response.message);
    $("#errorModal").modal("show");
  }
}

function ajaxError(jqXHR, textStatus, errorThrown) {
  $("#loadingSpinner").hide();
  console.log("Error when doing /api/search request");
  console.log(textStatus);
  console.dir(jqXHR);
  console.dir(textStatus);
}
