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
      <div class="links">
        <ul>
          <li>
            <a href="../">Introduction</a>
          </li>
          <li>
            <a class="help-link" @click="helpModal = true">Help</a>
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
  }
  
  .el-dialog {
    width: 80%;
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
  
  @media (max-width: 767px) {
    .header-container .logo,
    .header-container .links {
      line-height: 40px;
    }
    .header-container .links {
      float: none;
    }
    .header-container {
      text-align: center;
    }
    .header-container .links ul {
      padding-left: 0px;
    }
    .header-container .logo {
      margin-top: 8px;
    }
    .help-modal .el-dialog {
      width: 80% !important;
    }
  }
</style>