var tasks = {};

//bg-color alerts

var auditTask = function(taskEl) {
  //get from task element
  var date = $(taskEl).find("span").text().trim();
  //ensure it worked
  //console.log(date);
  //console.log(taskEl);

  //convert to moment object at 5pm
  var time = moment(date, "L").set("hour", 17);
  //should print out object for the value of the date variable, but at 5pm of that date
  console.log(time);

  //remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-dange");

  //apply new class if task is near/over due date
  if(moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }

};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");

  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  //check due date
  auditTask(taskLi);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    // console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("click", "p", function () {
  var text = $(this)
    .text()
    .trim();

  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

  $(this).replaceWith(textInput);
  textInput.trigger("focus")

  console.log(text);
});

//makes go back to normal when clicked outside
$(".list-group").on("blur", "textarea", function () {
  //get textarea's current value
  var text = $(this)
    .val()
    .trim();
  //get parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  //get task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  //recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  //replace textarea with p element
  $(this).replaceWith(taskP);

});

//value of data was changed - date change - blur => change : fixed inability to write date change in cards
$(".list-group").on("change", "input[type='text']", function () {
  //get current text
  var date = $(this)
    .val()
    .trim();

  //get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  //get the tasks position in the list of the other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  //update task in an array and re-save to local storage
  tasks[status][index].date = date;
  saveTasks();

  //recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date)

  //replace input with span element
  $(this).replaceWith(taskSpan)

  //pass tasks <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));

});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-save").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();

//due date was clicked
$(".list-group").on("click", "span", function () {
  //get current text
  var date = $(this)
    .text()
    .trim();

  //create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  //swap out elements
  $(this).replaceWith(dateInput);

  //enable jquery ui datepicker
  dateInput.datepicker({
    //minDate: 1,
    onClose: function(){
      //when calender is closed, force a "change" event on the dateInput
      $(this).trigger("change");
    }
  })

  //automatically focus on new element
  dateInput.trigger("focus");
});

$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    $(this).addClass("dropover");
    $('.bottom-trash').addClass("bottom-trash-drag")
    //console.log("activate", this);
  },
  deactivate: function(event) {
    $(this).removeClass("dropover");
    $('.bottom-trash').removeClass("bottom-trash-drag")
    //console.log("deactivate", this);
  },
  over: function(event) {
    $(event.target).addClass("dropover-active");
    //console.log("out", event.target);
  },
  out: function(event) {
    $(event.target).removeClass("dropover-active");
  },
  update: function(event) {
    //array to store the task data in
    var tempArr = [];

    //loop over current set of children in sortable list
    $(this).children().each(function() {
    //referring to child element of this index - SCOPED VARIABLES -?
    //console.log($(this));
    var text = $(this)
    .find("p")
    .text()
    .trim();

    var date = $(this)
    .find("span")
    .text()
    .trim();

    //add task data to the temp array as an object
    tempArr.push({
      text: text,
      date: date
    });

  });
  // trim down list's ID to match object property
  var arrName = $(this)
  .attr("id")
  .replace("list-", "");

  //update array on tasks object and save
  tasks[arrName] = tempArr;
  saveTasks();

  console.log(tempArr);
  }
});

//drag to trash

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    //console.log("drop");
    $(".bottom-trash").removeClass("bottom-trash-active");
  },
  over: function(event, ui) {
    //console.log("over");
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function(event, ui) {
    //console.log("out");
    $(".bottom-trash").removeClass("bottom-trash-active");
  }
});

//datepicker

$("#modalDueDate").datepicker({
  //minDate: 1
});

setInterval(function () {
  $(".card .list-group-item").each(function(index, el) {
    auditTask(el);
  })
}, 1800000)







//asynchronous functions - run in background until time is up the execute callback function
//                        V-V-V-V-V-V
// setTimeout(function(){
//   alert("this message is 5 seconds");
// }, 5000)

// setInterval(function() {
//   alert("this alert shows up every 5 sec")
// }, 5000)
