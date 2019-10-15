// Start of Welcoming user to dashboard
let user_string = localStorage.getItem("user");
let user = JSON.parse(user_string);
$("#name").text(user.name);
let userId = user.id;

$(document).ready(function() {
    $("#name").text(user.name);
    getRequests();
});

// End of Welcoming user to dashboard

let allRequests;

// Start of logging user out of dashboard
function logout() {
    localStorage.removeItem("user");
    window.location.href = "../index.html";
}
// End of logging user out of dashboard

function deleteRequest(id) {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete"
    }).then(remove => {
        if (remove.value) {
            $.ajax({
                method: "DELETE",
                url: "http://localhost:3000/Requests/" + id,
                success: function(result) {
                    getRequests();
                    notify("success", "successfully deleted");
                },
                error: function(err) {
                    console.log(err);
                    alert("Oops! an error occurred ", err);
                }
            });
        }
    });
}

function editRequest(id) {
    let request = allRequests.find(req => req.id == id);
    // appended the body to the onclick of the edit button (which is the modal body)

    $("#updateRequestBody").html(`
        <div>
        <div class="form-group">
        <label for="leaveName" class="col-form-label">Leave Title:</label>
        <input type="text" class="form-control" id="editLeaveName" value=${request.leave_title}>
    </div>
    <div class="form-group">
        <label for="startDate" class="col-form-label">Start Date:</label>
        <input type="date" class="form-control" id="editStartDate" value=${request.start_date}>
    </div>
    <div class="form-group">
        <label for="endDate" class="col-form-label">End Date:</label>
        <input type="date" class="form-control" id="editEndDate" value=${request.end_date}>
    </div>
    <div class="form-group">
        <label for="description">Description of leave</label>
        <textarea class="form-control" id="editDescription" rows="3">${request.description}</textarea>
    </div></div>`);

    $("#update-footer").html(
        `
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button> 
        <button type="button" class="btn btn-primary" id="updateButton" onclick="updateRequest(${request.id})">Save changes</button>
        `
    );
}

// this is to display all the user requests for the leave
function getRequests(status) {
    let url = "http://localhost:3000/Requests?userId=" + userId;

    if (status) {
        url = url + "?status=" + status;
    }

    $.ajax({
        method: "GET",
        url: url,
        success: function(result) {
            $("#requests").html("");
            $("#allCount").html(result.length);
            allRequests = result;
            result.forEach(function(request) {
                // start append: this is make sure that when a request is made it automatically appears on the dashboard
                let $buttons = "";
                if (request.status === "pending") {
                    $buttons = `<button class="btn btn-outline-success" type="button" data-toggle="modal" data-target="#editModal" onclick="editRequest(${
						request.id
					})">Edit</button>
                <button class="btn btn-outline-danger" onclick="deleteRequest(
                  ${request["id"]})">Delete</button>`;
                }

                $("#requests").append(`
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${request["leave_title"]}</h5>
                        <p class="card-text">${request["description"]}</p>
                        <p class="card-text">
                        ${request["start_date"]} to 
                        ${request["end_date"]}
                        </p>
                        <p class="card-text">${request["status"]}</p>
                        ${$buttons}
                    </div>
                </div>
              `);
                // end append
            });
        },
        error: function(err) {
            console.log(err);
            alert("Oops! an error occurred ", err);
        }
    });
}
// end display all leave requests
$("#addLeave").on("click", addRequests);
// $("#updateButton").on("click", function() {
//     alert("hdhdh");
// });

// add leave requests
function addRequests() {
    let leaveName = $("#leaveName")
        .val()
        .trim();
    let startDate = $("#startDate")
        .val()
        .trim();
    let endDate = $("#endDate")
        .val()
        .trim();
    let description = $("#description")
        .val()
        .trim();

    if (!leaveName) return alert("oops! please input your leave title!");
    if (!startDate) return alert("oops! please input your start date!");
    if (!endDate) return alert("oops! please input your end date!");
    if (!description)
        return alert("oops! please input a description of your leave!");

    const payload = {
        start_date: startDate,
        end_date: endDate,
        leave_title: leaveName,
        description: description,
        status: "pending",
        userId: userId
    };
    // POST leave request to db
    $.ajax({
        method: "POST",
        url: "http://localhost:3000/Requests",
        data: payload,
        success: function(result) {
            getRequests();
            notify("success", "leave request successful");
        }
    });

    $(".modal-body input").val("");
    $(".modal-body textarea").val("");
    $("#exampleModal").modal("toggle");
}
// end of add leave requests

// start of the update of the status of the requests
function updateRequest(id) {
    // edit leave requests
    let leaveName = $("#editLeaveName")
        .val()
        .trim();
    let startDate = $("#editStartDate")
        .val()
        .trim();
    let endDate = $("#editEndDate")
        .val()
        .trim();
    let description = $("#editDescription")
        .val()
        .trim();

    if (!leaveName) return alert("oops! please input your leave title!");
    if (!startDate) return alert("oops! please input your start date!");
    if (!endDate) return alert("oops! please input your end date!");
    if (!description)
        return alert("oops! please input a description of your leave!");

    const payload = {
        start_date: startDate,
        end_date: endDate,
        leave_title: leaveName,
        description: description
    };

    // send updated leave request to db
    $.ajax({
        method: "PATCH",
        url: "http://localhost:3000/Requests/" + id,
        data: payload,
        dataType: "JSON",
        success: function(result) {
            getRequests();
            notify("success", "successfully updated");
        }
    });

    $(".modal-body input").val("");
    $(".modal-body textarea").val("");
    $("#editModal").modal("toggle");
}
// end of the update of the status of the requests