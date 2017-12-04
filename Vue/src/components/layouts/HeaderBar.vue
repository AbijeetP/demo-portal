<template>
<div>
  <div class="modal help-modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal">&times;</button>
          <h5 class="modal-title" id="exampleModalLabel">Angular Material</h5>
        </div>
        <div class="modal-body">
          <ul>
            <li>
              This portal will allow us to add, edit and delete the task.
            </li>
            <li>
              This will call our CakePHP API. The CakePHP API will return the raw JSON which contains list of tasks.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="header-container">
    <div class="logo">
      <a href="http://osmosys.asia/">
        <img src="../../assets/osmosys-logo.png" alt="logo">
      </a>
    </div>
    <div class="links">
      <ul>
        <li>
          <a href="../">Introduction</a>
        </li>
        <li>
          <a class="help-link">Help</a>
        </li>
      </ul>
    </div>
  </div>
</div>
</template>


<script>
export default {
  name: 'HeaderBar'
};
</script>

<style scoped>
.header-container {
  background-color: #292b2c !important;
}
.help-modal {
  display: none;
}
.header-container .logo,
.header-container .links {
  display: inline-block;
  line-height: 65px;
  margin: 0px 20px;
}
.header-container .links {
  float: right;
}
.header-container .links ul {
  line-height: 65px;
  margin: 0px;
}
.header-container .links ul li {
  display: inline-block;
  font-size: 18px;
}
.header-container .links ul li a {
  color: #ffffff;
  cursor: pointer;
}
.header-container .links ul li .help-link {
  margin-left: 20px;
}
</style>