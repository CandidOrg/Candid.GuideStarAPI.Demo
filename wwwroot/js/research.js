var findocs;

$(document).ready(function () {
    $('#loadingSpinner').show();

    // init Vue 
    var app = new Vue({
        el: "#app", // div target
        filters: {
            json: (value) => { return JSON.stringify(value, null, 2) },
            currency: (value) => { return ("$" + value + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") }
        },
        data: {
            // declare our models for rendering to Vue
            verifiedOrg: {
                organization_id: null,
                organization_name: null,
                ein: null,
                city: null,
                logo_url: null,
                mission: null,
                website_url: null,
                gs_profile_update_level: null,
                gs_profile_update_level_logo: null,
                financials: {
                    most_recent_year_financials: {
                        fiscal_year: null,
                        data_source: null,
                        assets_total: null,
                        revenue_contributions: null,
                        revenue_govt_grants: null,
                        revenue_program_services: null,
                        revenue_investments: null,
                        revenue_special_events: null,
                        revenue_sales: null,
                        revenue_other: null,
                        total_revenue: null,
                        expense_administration: null,
                        expense_program_services: null,
                        expense_fundraising: null,
                        expenses_total: null
                    }
                },
                operations: {
                    officers_directors_key_employees: []
                }
            },
            currentLeader: { name: "", title: "" },
            cc: { // cc shorthand for charity check
                pub78_verified: null,
                most_recent_pub78: null,
                most_recent_irb: null,
                bmf_status: null,
                most_recent_bmf: null,
            },
            // used for raw JSON display
            researchJson: {},
            finJson: {},
            assLiabJson: {}
        },
        watch: {
            // in Vue, the watch methods are triggered when coresponding data changes
            // in this case, we're just updating highcharts and hiding the layout if
            // the ein is invalid
            verifiedOrg: function (data) {
                // hide template if ein is invalid
                if (data.ein != null && data.ein.length > 0) {
                    $("#verifiedOrg").show();
                } else {
                    $("#verifiedOrg").hide();
                    $("#textData").hide();
                    $("#revenueChart").hide();
                    $("#assLibChart").hide();
                }
                // create data for highcharts
                if (data.financials.most_recent_year_financials.total_revenue != null && !isNaN(data.financials.most_recent_year_financials.total_revenue) && data.financials.most_recent_year_financials.total_revenue > 0) {

                    $("#textData").show();
                    $("#revenueChart").show();

                    revenueChart.series[0].setData([{
                        name: "Contributions",
                        y: data.financials.most_recent_year_financials.revenue_contributions
                    }, {
                        name: "Govt Grants",
                        y: data.financials.most_recent_year_financials.revenue_govt_grants
                    }, {
                        name: "Investments",
                        y: data.financials.most_recent_year_financials.revenue_investments
                    }, {
                        name: "Other",
                        y: data.financials.most_recent_year_financials.revenue_other
                    }, {
                        name: "Program Services",
                        y: data.financials.most_recent_year_financials.revenue_program_services
                    }, {
                        name: "Sales",
                        y: data.financials.most_recent_year_financials.revenue_sales
                    }, {
                        name: "Special Events",
                        y: data.financials.most_recent_year_financials.revenue_special_events
                    }]);
                    revenueChart.series[1].setData([{
                        name: "Administration",
                        y: data.financials.most_recent_year_financials.expense_administration
                    }, {
                        name: "Fundraising",
                        y: data.financials.most_recent_year_financials.expense_fundraising
                    }, {
                        name: "Program Services",
                        y: data.financials.most_recent_year_financials.expense_program_services
                    }]);
                    revenueChart.setTitle({ text: "Most Recent (" + data.financials.most_recent_year_financials.fiscal_year + ") Revenue and Expense Breakdown" });
                } else {
                    $("#textData").hide();
                    $("#revenueChart").hide();
                }

                //assetLiabilityChart
                var areaAssData = [];
                var areaLiabData = [];
                for (var i = 0; i < data.financials.f990_financials.length; i++) {
                    var year = new Date(Date.parse(data.financials.f990_financials[i].period_begin)).getFullYear();
                    if (typeof year == "number") {
                        areaAssData.push([year, data.financials.f990_financials[i].assets_total]);
                        areaLiabData.push([year, data.financials.f990_financials[i].liabilities_total]);
                    }
                }
                if (areaAssData.length > 0) {
                    assetLiabilityChart.series[0].setData(areaAssData);
                    assetLiabilityChart.series[1].setData(areaLiabData);
                    $("#assLibChart").show();
                } else {
                    $("#assLibChart").hide();
                }
            }
        },
        mounted: function () {
            // this is only used as a debug option if orgId is upplied manually
            if (orgId && orgId > 0) {
                $("#searchTerms").val(orgId); // sync orgid in url with textbox
            }
        }
    });
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });
    // init highcharts
    var assetLiabilityChart = Highcharts.chart("assLibChart", {
        chart: {
            type: "area"
        },
        title: {
            text: "Assets vs Liabilities Over Time"
        },

        tooltip: {
            pointFormat: '{series.name}: <b>${point.y:,.0f}</b>'
        },
        xAxis: {
            allowDecimals: false,
            labels: {
                formatter: function () {
                    return this.value;
                }
            }
        },
        yAxis: {
            title: {
                text: "USD"
            },
            labels: {
                formatter: function () {
                    return this.value > 999 ? '$' + numberWithCommas((this.value / 1000)) + 'k' : '$' + this.value;
                }
            }
        },
        plotOptions: {
            series: {
                fillOpacity: 0.2
            },
            area: {
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                },
            }
        },
        series: [
            {
                name: "Assets",
                color: '#6fcd5e',
                data: []
            },
            {
                name: "Liabilities",
                color: '#e03737',
                data: []
            }
        ]
    });
    // init more highcharts
    var revenueChart = Highcharts.chart("revenueChart", {
        chart: {
            type: "pie",
            margin: [0, 0, 0, 0],
            spacingTop: 0,
            spacingBottom: 0,
            spacingLeft: 0,
            spacingRight: 0
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotoptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            },
            size: '100%'
        },
        title: {
            text: "Most Recent Revenue and Expense Breakdown"
        },
        series: [{
            name: "Revenue",
            size: 150,
            center: ['25%', '50%'],
            data: []
        },
        {
            name: "Expense",
            size: 150,
            center: ['75%', '50%'],
            data: []
        }]
    });

    // enter button also triggers search
    $("#searchTerms").keyup(function (event) {
        if (event.keyCode === 13) {
            $("#searchButton").click();
        }
    });


    var orgId = $("#searchTerms").val();
    /*
     * Make a GET call using AJAX to our controller, normally the controller would then manipulate and return
     * a DTO for json. Since we want to display the raw JSON I opted to just return the raw JSON instead.
     */
    $("#searchButton").on("click", function (event) {
        orgId = $("#searchTerms").val();
        var organizationId = orgId; // prioritize textbox over url
        $.ajax({
            method: "GET",
            url: "/premier/get",
            data: { ein: "" + organizationId },
            dataType: "json",
            beforeSend: function () {
                $("#loadingSpinner").show();
            },
            success: function (data) {
                $("#loadingSpinner").hide();
                if (data.code === 200) {
                    app.researchJson = data;
                    app.finJson = { financials: data.data.financials };
                    app.verifiedOrg = data.data.summary;
                    app.verifiedOrg.financials = data.data.financials;
                    app.verifiedOrg.operations = data.data.operations;
                    app.currentLeader.name = data.data.operations.leader_name;
                    app.currentLeader.title = data.data.operations.officers_directors_key_employees[0].title;
                    app.cc = data.data.charitycheck;
                } else {
                    $("#errorMessage").html(data.message);
                    $("#errorModal").modal("show");
                    console.dir(data);
                }
                findocs = {
                    fin990s: data.data.financials.f990_financials,
                    finPFs: data.data.financials.pf990_financials,
                    finEZs: data.data.financials.f990ez_financials,
                };
                GetYearList();
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

    // bootstrap tooltip implementation
    $('[tool-tip-toggle="tooltip-json"]').tooltip({
        placement: 'left'
    });

    // display raw JSON modals
    $("#researchRawJson").on("click", function () {
        $("#rawJson").html(jsonPrettyPrint.toHtml(app.researchJson));
        $("#rawJsonModal").modal("show");
    });
    $("#revenueRawJson").on("click", function () {
        $("#rawJson").html(jsonPrettyPrint.toHtml(app.finJson));
        $("#rawJsonModal").modal("show");
    });
    $("#assLibRawJson").on("click", function () {
        $("#rawJson").html(jsonPrettyPrint.toHtml(app.assLiabJson));
        $("#rawJsonModal").modal("show");
    });

    // formatting currency in charts
    var numberWithCommas = function (x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    // load up profile on page load
    if (orgId) {
        $("#searchButton").click();
    }
    else {
        $('#loadingSpinner').hide();
    }

    $('#fiscal-year-select').change(function () {
        $('.fiscal-year-details').hide();
        $('#year-' + $(this).val()).show();        
    });
});

function GetYearList() {
    let yearlist = [];
    let querylist = [];

    if (findocs.fin990s) {
        for (let i = 0; i < findocs.fin990s.length; i++) {
            yearlist.push('9-' + new Date(findocs.fin990s[i].period_end).getFullYear());
            querylist.push(GenerateBalanceSheet(findocs.fin990s[i], '9'));
        }
  }

    yearlist = yearlist.filter((x, i, a) => a.indexOf(x) == i).sort(function (a, b) { return b.substring(2) - a.substring(2) });

    var selectList = $('.fiscal-year-select')[0];

    for (let j = 0; j < yearlist.length; j++) {
        $(selectList).append('<option value="' + yearlist[j] + '">' + yearlist[j].substring(2) + '</option>');
    }

    $.when(...querylist).then(function (...args) {
        args.forEach(function (r) {
            $("#balance-sheet-list").append(r[0]);
        });
        $('#fiscal-year-select').trigger('change');
        $('#loadingSpinner').hide();
        $('#app').show();
    });

    if (!yearlist.length) {
        $('#fiscal-year-select').hide();
    }
}

function GenerateBalanceSheet(data, type, index) {
    return $.ajax({
        method: "POST",
        url: "/premier/GetFinTable",
        data: { orgData: JSON.stringify(data), type: type },
        dataType: "html"
    });
}