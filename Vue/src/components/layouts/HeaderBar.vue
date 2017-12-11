<template>
  <div>
    <el-dialog title="Vue" :visible.sync="helpModal" class="help-modal">
      <ul>
        <li>
          This portal will allow us to add, edit and delete the task.
        </li>
        <li>
          This will call our CakePHP API. The CakePHP API will return the raw JSON which contains list of tasks.
        </li>
      </ul>
    </el-dialog>
    <div class="header-container">
      <div class="logo">
        <a href="http://osmosys.asia/">
          <img src="../../assets/osmosys-logo.png" alt="logo">
        </a>
      </div>
      <div class="page-title">
        <h1>Vue Portal</h1>
      </div>
      <div class="links">
        <ul>
          <li>
            <a href="../">Introduction</a>
          </li>
          <li>
            <a class="help-link" @click="helpModal = true">About</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>


<script>
  export default {
    name: 'HeaderBar',
    data: function() {
      return {
        helpModal: false
      };
    }
  };
</script>

<style>
  .header-container {
    background-color: #292b2c !important;
    text-align: center;
  }

  .el-dialog {
    width: 60%;
  }

  .header-container .logo {
    float: left;
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

  .page-title {
    display: inline-block;
  }

  .page-title h1 {
    display: inline-block;
    margin: 0;
    color: #fff2f2;
    font-size: 2.5em;
    line-height: 2em;
  }

  @media (max-width: 767px) {
    .header-container .logo,
    .header-container .links,
    .header-container .links ul {
      line-height: 30px;
    }
    .page-title h1 {
      font-size: 1.5em;
    }
    .header-container .links {
      float: none;
    }
    .page-title {
      display: block;
    }
    .header-container {
      text-align: center;
    }
    .header-container .links ul {
      padding-left: 0px;
    }
    .header-container .logo {
      margin-top: 8px;
      float: none;
    }
    .help-modal .el-dialog {
      width: 80% !important;
    }
  }
</style>