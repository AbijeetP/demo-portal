$(document).ready(function () {
  $('#demoList').DataTable({
    "ajax": "Common/data/data.json",
    "paging": false,
    "info": false,
    "order": [[0, 'asc']],
    "columnDefs": [
      {
        "render": function (data, type, row) {
          return "<a href=" + row.link + ">" + row.moduleName + "</a>";
        },
        "width": "20%",
        "orderable": false,
        "targets": 0
      }, {
        "render": function (data, type, row) {
          return row.desc;
        },
        "width": "59%",
        "orderable": false,
        "targets": 1
      }, {
        "render": function (data, type, row) {
          return row.tech;
        },
        "width": "21%",
        "orderable": false,
        "targets": 2
      }
    ],
    "dom": ' <"search"f><"top"l>rt<"bottom"ip><"clear">',
  });

  $('.search input').addClass('form-control');

});