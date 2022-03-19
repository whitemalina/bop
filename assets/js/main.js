//Main
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
    page: "startPage",
    selectionInfo: null,
    regist: {
      step: 1,
      name: "",
      lastName: "",
      patronymic: "",
      group: "",
      studNum: "",
      email: "",
      password: "",
      repass: "",
    },
    login: {
      email: "",
      password: "",
    },
    profile: {
      name: null,
      studNum: null,
      group: null,
      email: null,
      password: "*************",

      timestamp: null,
      scores: 225,
      completedStages: null,
      step1: 1,
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
          correctAnswer: "test1",
        },
        {
          id: 2,
          correctAnswer: "test2",
        },
        {
          id: 3,
          correctAnswer: "test3",
        },
      ],
    },
    groupLists: ["915", "914"],
  },
  computed: {},
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
              this.page = "succes";
            }
          } else {
            notyf.error("Заполните все поля");
          }

          console.log(this.regist);
      }
    },

    auth() {
      let email = this.login.email;
      let password = this.login.password;

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
        // временно
        switch (email) {
          case "student@surpk.ru":
            if (password == "student") {
              notyf.success("test auth student");
              this.setPage("lk");
            }
            break;
          case "admin@surpk.ru":
            if (password == "admin") {
              notyf.success("test auth teacher");
              this.setPage("lkteacher");
            }
            break;
          default:
            notyf.error("Неверный логин или пароль");
        }
      }
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

    checkAnswer(taskId) {
      if (
        this.lesson.answer.split(/[<,>,/]/gi).join("") ==
        this.lesson.tasks[taskId - 1].correctAnswer
      ) {
        notyf.success("Молодец");
        this.lesson.taskId = 0;
        this.lesson.finished = 1;
        this.lesson.lastL;
      } else {
        notyf.error("Ответ не правильный");
      }
      console.log(this.lesson.answer.split(/[<,>,/]/gi).join(""));
    },
    setLesson() {
      this.taskId = 0;

      switch (this.lesson.lastLessonId) {
        case 1:
          this.lesson.finished = 0;
          this.lesson.lastLessonId += 1;
          this.lesson.lessonId = this.lesson.lastLessonId;
          this.lesson.header = "HTML";
          break;
        case 2:
          this.lesson.lastLessonId += 1;
          this.lesson.finished = 0;
          this.lessonId = this.lesson.lastLessonId;
          this.lesson.header = "HTML";
          break;
        case 3:
          this.lesson.header = "CSS";
      }
    },
    openProfile() {
      let profile = this.profile;
      this.profile.completedStages =
        profile.step1 + profile.step2 + profile.step3;
      this.setPage("lk");
    },
  },
});
