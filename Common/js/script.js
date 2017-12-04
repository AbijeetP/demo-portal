$(document).ready(function () {
  var technologies = [
    {
      name: 'HTML',
      class: 'badge-secondary'
    }, {
      name: 'CSS',
      class: 'badge-primary'
    }, {
      name: 'AngularJS',
      class: 'badge-success'
    }, {
      name: 'Material-UI',
      class: 'badge-info'
    }, {
      name: 'CakePHP 3',
      class: 'badge-warning'
    }, {
      name: 'jQuery',
      class: 'badge-danger'
    }, {
      name: 'Bootstrap 4',
      class: 'badge-dark'
    }, {
      name: 'Google Maps',
      class: 'badge-purple'
    }, {
      name: 'Angular Material',
      class: 'badge-blue'
    },
  ];

  function getTechClass(tech) {
    for (var i = 0; i < technologies.length; i++) {
      if (technologies[i].name === tech) {
        return technologies[i].class;
      }
    }
    return 'badge-primary';
  }

  $('#demoList').DataTable({
    ajax: "Common/data/data.json",
    paging: false,
    info: false,
    order: [[0, 'asc']],
    columnDefs: [
      {
        render: function (data, type, row) {
          return "<a href=" + row.link + ">" + row.moduleName + "</a>";
        },
        width: "20%",
        orderable: false,
        targets: 0
      }, {
        render: function (data, type, row) {
          return "<p>" + row.desc + "</p>";
        },
        width: "59%",
        orderable: false,
        targets: 1
      }, {
        render: function (data, type, row) {
          var techs = row.tech.split(",");
          var techHtml = '';
          for (var i = 0; i < techs.length; i++) {
            var currentTech = $.trim(techs[i]);
            var techCls = getTechClass(currentTech);
            techHtml += '<span class="badge ' + techCls + '">' + currentTech + '</span>';
          }
          return techHtml;
        },
        width: "21%",
        orderable: false,
        targets: 2
      }
    ],
    dom: ' <"search"f><"top"l>rt<"bottom"ip><"clear">'
  });

  $('.search input').addClass('form-control');

});