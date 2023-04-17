Validator({
    form: '#form-1',
    formGroup: ".form-group",
    errorSelector: ".form-message",
    rules: [
        Validator.isRequired('#fullname', "Vui lòng phải nhập tên đầy đủ của bạn"),
        Validator.isRequired('#email', "Vui lòng nhập tên email đầy đủ"),
        Validator.isRequired('#password_confirmation', "Vui lòng nhập mật khẩu"),
        Validator.isRequired('input[name="gender"]', "Vui lòng chọn giới tính"),
        Validator.isEmail('#email'),
        Validator.isLength('#password', 6),
        Validator.isConfirmed("#password_confirmation", () => {
            return document.querySelector("#form-1 #password").value;
        }, "Mật khẩu nhập lại không chính xác"),
    ],
    onSubmit: (data) => {
        // Call api, lấy dữ liệu để đăng nhập
        console.log(data);
    }
});