$(document).ready(function () {
  $('#demoList').DataTable({
    "ajax": "Common/data/data.json",
    "paging": false,
    "info": false,
    "order": [[0, 'asc']],
    "columnDefs": [
      { "targets": [0, 1, 2], "orderable": false }
    ],
    "dom": ' <"search"f><"top"l>rt<"bottom"ip><"clear">',
    "columns": [
      { "data": "link", "width": "20%" },
      { "data": "desc", "width": "60%" },
      { "data": "tech", "width": "20%" }
    ]
  });

  $('.search input').addClass('form-control');

});