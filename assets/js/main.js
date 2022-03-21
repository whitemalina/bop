//Main

const HOST = "http://127.0.0.1:8000/api/";

const notyf = new Notyf({
  position: { x: "center", y: "top" },
  duration: 4000,
  dismissible: true,
});

particlesJS.load(
  "particles_js",
  "./assets/js/particlesjs-config.json",
  function () {
    console.log("particles.js loaded");
  }
);

$("body").on("input", "#auth_Login", function () {
  let val = $(this).val();
  $(this).val(val.replace(/[\W]/g, ""));
});

$("body").on("input", "#reg_Login", function () {
  let val = $(this).val();
  $(this).val(val.replace(/[\W]/g, ""));
});

$("body").on("input", "#selection__Input", function () {
  let val = $(this).val();
  val = val.replace("</", "");
  val = val.replace(">", "");
  $(this).val("</" + val + ">");
});

$("body").on("keyup", "#selection__Input", function (e) {
  if (e.keyCode == 13) {
    let val = $(this).val();
    val = val.replace("</", "");
    val = val.replace(">", "");
  }
});
// пароль по кнопке
$('body').on('click', '.password-control', function(){
	if ($('#password-input').attr('type') == 'password'){
		$(this).addClass('view');
		$('#password-input').attr('type', 'text');
	} else {
		$(this).removeClass('view');
		$('#password-input').attr('type', 'password');
	}
	return false;
});

const sendAuth = () => {
  if ($("#auth_Email").prop("disabled")) return;
  $("#error_msg_1").html("");
  $("#error_msg_2").html("");

  let email = $("#auth_Email").val();
  let password = $("#auth_Pass").val();

  if (email.length < 5) {
    $("#error_msg_1").html("Недопустимая почта!");
    return;
  }

  if (password.length < 6 || password.length > 32) {
    $("#error_msg_2").html("Недопустимый пароль!");
    return;
  }

  $("#auth_Email").prop("disabled", true);
  $("#auth_Pass").prop("disabled", true);

  $.ajax({
    url: "/do/signin",
    type: "POST",
    dataType: "html",
    data: {
      auth: "",
      email: email,
      password: password,
    },
    success: function (response) {
      let str = response.split(" | ");

      if (str[0].includes("true")) {
        notyf.success(str[1]);
        setTimeout(() => {
          window.location = "/" + str[2];
        }, 1500);
      } else {
        notyf.error(str[1]);
        $("#auth_Email").prop("disabled", false);
        $("#auth_Pass").prop("disabled", false);
      }
    },
    error: function (response) {
      notyf.error(response);
      $("#auth_Email").prop("disabled", false);
      $("#auth_Pass").prop("disabled", false);
    },
  });
};

const toTask = (lessonId) => {
    $.ajax({
      url: "/do/taskManager",
      type: "POST",
      dataType: "html",
      data: {
        getTask: "true",
        lessonId: lessonId,
      },
      success: function (response) {
        if (response) {
          $("#lesson").html(response);
        }
      },
      error: function (response) {
        notyf.error(response);
      },
    });
  },
  endTask = (lessonId) => {
    let answer = $("#lesson_answer").val();
    $.ajax({
      url: "/do/taskManager",
      type: "POST",
      dataType: "html",
      data: {
        endTask: "true",
        lessonId: lessonId,
        answer: answer,
      },
      success: function (response) {
        let str = response.split(" | ");
        console.log(response);
        if (str[0].includes("true")) {
          $("#lesson").html(str[1]);
        } else {
          notyf.error(str[1]);
        }
      },
      error: function (response) {
        notyf.error(response);
      },
    });
  };

var app = new Vue({
  el: "#app",
  data: {
   // page: "startPage",
    page: "startPage", // temp
    selectionInfo: null,
    user: null,
    editPassword: '       ',
    passwordEye: false,
    passwordEdit: false,
    
    admin: {
      countReg: '',
      balles: '',
      finished: '',
    },
    group:{
      id: '',
      students: {

      }
    },
    emailEdit: false,
    saveButton: false,
    regist: {
      step: 1,
      name: null,
      lastName: null,
      patronymic: null,
      group: null,
      studNum: null,
      email: '',
      password: '',
      
      repass: '',
    },
    login: {
      email: "",
      password: "",
    },
    users: {

    },

    profile: {
      isTeacher: false,
      name: null,
      fio: '',
      surname: '',
      patronymic: '',
      studNum: null,
      group: null,
      email: '',
      password: "*************",

      created_at: null,
      score: 0,
      completedStages: null,
      step1: 0,
      step2: 0,
      step3: 0,
    },
    lesson: {
      header: "дизайн",
      lessonId: 1,
      lastLessonId: 1,
      answer: "",
      finished: 1,
      taskId: 0,
      tasks: [
        {
          id: 1,
          correctAnswer: "это информация представленная в определенном виде которая располагается на Web-сервере",
        },
        {
          id: 2,
          correctAnswer: "title",
        },
        {
          id: 3,
          correctAnswer: "определяет внешний вид документа",
        },
      ],
    },
    groupLists: ["915", "914", "015", "014"],
  },
  computed: {},
  mounted() {
    this.loadLocalData();
    
  },
  methods: {
    // Regist или login?
    selection() {
      console.log(this.selectionInfo);
      if (/regis/i.test(this.selectionInfo)) {
        this.page = "regist";
      } else if (/logi/i.test(this.selectionInfo)) {
        this.page = "login";
      }
    },
    // Шаги регистрации
    nextStep(step) {
      re = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
      // Валидация при регистрации
      switch (step) {
        case 1:
          console.log(this.regist);
          if (
            (this.regist.name.length >= 1) &
            (this.regist.lastName.length >= 1) &
            (this.regist.patronymic.length >= 1)
          ) {
            this.regist.step += 1;
          } else {
            notyf.error("Заполните все поля");
          }
          break;
        case 2:
          if (this.regist.group && this.regist.studNum.length >= 1) {
            if (this.regist.studNum.length == 5) {
              this.regist.step += 1;
            } else {
              notyf.error("Перепроверьте введенные данные");
            }
          } else {
            notyf.error("Заполните все поля");
          }

          console.log(this.regist);
          break;

        case 3:
          if (
            this.regist.email.length >= 1 &&
            this.regist.password.length >= 1 &&
            this.regist.repass.length >= 1
          ) {
            if (!re.test(this.regist.email)) {
              notyf.error("Неправильная почта");
            } else {
              this.register() == true?this.setPage("succes"):'';
            }
          } else {
            notyf.error("Заполните все поля");
          }

          console.log(this.regist);
      }
    },

    async register(form) {
      let data = {
        name: this.regist.name,
        surname: this.regist.lastName,
        patronymic: this.regist.patronymic,
        password: this.regist.password,
        email: this.regist.email,
        groupNumber: this.regist.group,
        studNum: this.regist.studNum,
      };

      await fetch(HOST + "register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.status == 201) {
            result = 1;
          } else {
            result = 2;
          }
          return res.json();
        })
        .then((data) => {
          console.log(data);
          // if (result == 1) {
          //   // this.user = data;
          //   // this.saveLocalData();

          // } else {

          // }
          if (result == 1) {
            notyf.success("Вы успешно зарегистрировались");
            this.login.email = this.regist.email;
            this.login.password = this.regist.password;
            this.setPage("succes");
          } else {
            notyf.error("ERROR: " + data.errors.email);
          }
        });
    },

    logout() {
      localStorage.clear();
      location.reload();

    },

    async saveLocalData() {
      await localStorage.setItem("user", JSON.stringify(this.user));
    },

    async loadLocalData() {
      this.user = await JSON.parse(localStorage.getItem("user"));

      console.log(this.user);

      // this.updateForm.login = this.user.username;
    },

    async loadProfile() {
      let profile;
      let data;
      await fetch(HOST + "profile", {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.user.token,
        },
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          profile = data;
        });
      this.profile.name = profile.name;
      this.profile.surname = profile.surname;
      this.profile.patronymic = profile.patronymic;
      this.profile.studNum = profile.studNum
      
      this.profile.email = profile.email

      this.profile.group = profile.group

      this.profile.fio = this.profile.surname + ' ' + this.profile.name + ' ' + this.profile.patronymic
      
      if (profile.IsAdmin == '1') {
        this.profile.isTeacher = true
      } else 

      console.log(profile);

      this.profile.score = profile.score;
      profile.completed[0] == 1 ? (this.profile.step1 = 1) : (this.profile.step1 = 0);
      profile.completed[1] == 1 ? (this.profile.step2 = 1) : (this.profile.step2 = 0);
      profile.completed[2] == 1 ? (this.profile.step3 = 1) : (this.profile.step3 = 0);

      this.profile.completedStages =
        Number(profile.completed[0]) +
        Number(profile.completed[1]) +
        Number(profile.completed[2]);

      let date = new Date(profile.created_at);

      var options = {
        //era: 'long',
        year: "numeric",
        month: "long",
        day: "numeric",
        //weekday: 'long',
        timezone: "UTC",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      };

      //console.log(date.toLocaleString("ru", options));

      this.profile.created_at = date.toLocaleString("ru", options);
    },

    async sendRequest(method, route, body) {
      let response;

      if (body == 'show') {
        await fetch(HOST + route, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.user.token,
          },
        })
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            response = data;
          });
        return response;
      }

      await fetch(HOST + route, {
        method: method,
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.user.token,
        },
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          response = data;
        });
      return response;
    },

    async passBlock(id) {
      let body = {
        completed: "",
        score: Number(this.profile.score)
      };
      await this.loadProfile()
      console.log(id);
      switch (id) {
        case 1:
          body.completed = '100'
          body.score += 50
          this.profile.score = body.score
          this.profile.step1 = 1
          this.lesson.header = 'дизайн'
          await this.sendRequest("PATCH", "update", body);
        break
        case 2:
          body.score += 50
          body.completed = '110'
          this.profile.score = body.score
          this.lesson.header = 'html'
          this.profile.step2 = 1
          await this.sendRequest("PATCH", "update", body);
        break
        case 3:
          body.score += 50
          body.completed = '111'
          this.profile.score = body.score
          this.lesson.header = 'css'
          this.profile.step3 = 1
          await this.sendRequest("PATCH", "update", body);
      }
    },


    
    async auth() {
      let email = this.login.email;
      let password = this.login.password;

      let data = {
        email: email,
        password: password,
      };

      // Валидация?
      function validate(email, password) {
        re = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
        if (email.length >= 1 && password.length >= 1) {
          if (!re.test(email)) {
            notyf.error("Неправильная почта");
            return false;
          } else {
            return true;
          }
        } else {
          notyf.error("Заполните все поля");
          console.log(email, password);
          return false;
        }
      }

      // если валидация успешна, продолжаем
      if (validate(email, password)) {
        // авторизация
        await fetch(HOST + "login", {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => {
            if (res.status == 200) {
              result = 1;
            } else {
              result = 2;
            }
            return res.json();
          })
          .then((data) => {
            if (result == 1) {
              this.user = data;
              this.saveLocalData();
              notyf.success("Успешный вход");
              this.setPage("lesson");
              console.log(data.completed[0]);
              console.log(data.completed[1]);
              console.log(data.completed[2]);
              if (data.completed[0] == "1") {
                if (data.completed[1] == "1") {
                  if (data.completed[2] == "1") {
                    this.setPage(lk);
                  } else {
                    this.lesson.lastLessonId = 2;
                    this.lesson.lessonId = 3;
                    console.log("3 if");
                    this.giveHeader(3)
                  }
                } else {
                  this.lesson.lastLessonId = 2;
                  this.lesson.lessonId = 2;
                  this.giveHeader(2)
                  console.log("2 if");
                }
              } else {
                // this.lesson.lastLessonId = 0;
                // this.lesson.lessonId = 0;
                console.log("1 if");
              }
            } else {
              notyf.error(data.errors.login[0]);
            }
            console.log(data);
          });

      }

      //clear
      this.login.email = '';
      this.login.password ='';
    },

    setPage(page) {
      this.page = page;
      console.log(page);
    },

    setTask(task) {
      this.lesson.lastLessonId = this.lesson.lessonId;
      this.lesson.lessonId = 0;
      this.lesson.taskId = task;
    },
    giveHeader(lesson) {
      switch(lesson){
        case 1:
          this.lesson.header = 'дизайн'
          break
        case 2:
          this.lesson.header = 'html'
          break
        case 3:
          this.lesson.header = "css"
      }
    },
    checkAnswer(taskId) {
      //
      if (
        this.lesson.answer.split(/[<,>,/]/gi).join("") ==
        this.lesson.tasks[taskId - 1].correctAnswer
      ) {
        this.lesson.answer = ''
        notyf.success("Молодец");
        this.passBlock(taskId);
        this.lesson.taskId = 0;
        this.lesson.finished = 1;
        // this.lesson.lastL;
      } else {
        console.log(this.lesson.answer.split(/[<,>,/]/gi).join(""));
        this.lesson.answer = ''
        
        notyf.error("Ответ не правильный");
      }
      console.log(this.lesson.answer.split(/[<,>,/]/gi).join(""));
    },
    setLesson() {
      this.taskId = 0;
      switch (this.lesson.lastLessonId) {
        case 1:
          this.giveHeader(2)
          this.lesson.finished = 0;
          this.lesson.lastLessonId += 1;
          this.lesson.lessonId = this.lesson.lastLessonId;
          console.log('1 lsi: ' + this.lesson);
          
          break;
        case 2:
          this.giveHeader(3)
          this.lesson.lastLessonId += 1;
          this.lesson.finished = 0;
          this.lesson.lessonId = this.lesson.lastLessonId;
          console.log('2 lsi: ' + this.lesson);
          break;
        default:
          this.setPage('lk')
      }
    },
    async openProfile(text) {
      this.loadProfile();
      
      if (text == 'admin') {
        let users = {}
        this.users = await this.sendRequest("get", "show", 'show');
        users = this.users
        this.admin.countReg = users.length
        console.log(users);
        console.log(users.length);
        this.admin.balles = 0
        this.admin.finished = 0
        for (i = 0; i < users.length; i++) { // используем существующую переменную
          console.log(users[i]);
          this.admin.balles += Number(users[i].score)

          if (users[i].completed === '111') {
            this.admin.finished += 1
          }
        }




        this.setPage('lkAdmin')
        

      } else this.setPage("lk");


    },

    password() {
      this.editPassword = ''
      this.saveButton = true;

      this.passwordEdit = true
    },
    email() {
      this.profile.email = ''
      this.passwordEdit = false
      this.saveButton = true;
    },
    async saveProfile(){
      let password = ''
      let email = ''

      password = this.editPassword 
      email = this.profile.email

      console.log(email);
      console.log(password);

      function validate(email, password) {
        re = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
        if (email.length >= 1 && password.length >= 1) {
          if (!re.test(email)) {
            notyf.error("Неправильная почта");
            return false;
          } else {
            return true;
          }
        } else {
          notyf.error("Заполните все поля");
          // console.log(email, password);
          return false;
        }
      }

      if (validate(email, password)) {
        let body = {}
        notyf.success('Успешно')
        body.email = email
        body.password = password
        console.log(password);
        await this.sendRequest("PATCH", "update-user", body);
      }
      this.editPassword = false
      this.emailEdit = false
    },

    async start() {
      this.user != null?await this.loadProfile(): '';
      

      if (this.user != null){
        this.page = "lesson"
        if (this.profile.step1 == 1) {
          if (this.profile.step2 == 1) {
            if (this.profile.step3 == 1) {
              this.setPage('lk');
            } else {
              this.lesson.lastLessonId = 3;
              this.lesson.lessonId = 3;
              this.giveHeader(3)
              console.log("3 if");
            }
          } else {
            this.lesson.lastLessonId = 2;
            this.lesson.lessonId = 2;
            this.giveHeader(2)
            console.log("2 if");
          }
        } else {
          this.lesson.lastLessonId = 1;
          this.lesson.lessonId = 1;
          this.giveHeader(1)
          console.log("1 if");
        }
      } else {
        this.page = 'selectionPage'
      }
    },

    checkGroup(group) {
      notyf.success(group)
      this.group.id = group
      users = this.users

      let tempData = {
        
      }
      let a = 0
      for (i = 0; i < users.length; i++) { // используем существующую переменную
        if (users[i].groupNumber == group) {
          
          tempData[a] = users[i]
          tempData[a].step1 = false
          tempData[a].step2 = false
          tempData[a].step3 = false

          if (users[i].completed[0] == 1) {
            tempData[a].step1 = true

            if (users[i].completed[1] == 1) {
              tempData[a].step2 = true

              if (users[i].completed[1] == 1) {
                tempData[a].step3 = true
              } 
            } 
          } 
          a++
        }
      }

      this.group.students = tempData

      console.log(tempData);
      this.setPage('groupInfo');
      
    }
  },
});
