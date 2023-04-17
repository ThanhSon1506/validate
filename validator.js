// Đỗi tượng validator
function Validator(options) {
    let selectorRules = {};
    let formElement = document.querySelector(options.form);
    let errorMessage;

    // 1. Hàm lấy thẻ element cha
    // ========================================================================
    function handelGetElementParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    // 2. Hàm thực hiện khi giá trị input là true
    // ========================================================================
    function handelCheckInputTrue(inputElement) {
        let errorElement = handelGetElementParent(inputElement, options.formGroup).querySelector(options.errorSelector);
        errorElement.innerText = "";
        handelGetElementParent(inputElement, options.formGroup).classList.remove('invalid');

    }
    // 3. Hàm thực hiện khi giá trị input không hợp lệ
    // ========================================================================
    function handelCheckInputFalse(inputElement, errorMessage) {
        let errorElement = handelGetElementParent(inputElement, options.formGroup).querySelector(options.errorSelector);
        errorElement.innerText = errorMessage;
        handelGetElementParent(inputElement, options.formGroup).classList.add('invalid');
    }
    // ========================================================================
    function handelValidate(inputElement, rule) {
        // Kiểm tra và lấy các rule theo key selector
        let rules = selectorRules[rule.selector];
        // Lặp qua từng rule và kiểm tra, nếu có lỗi dừng việc kiểm tra
        for (let i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelectorAll(rule.selector + ':checked'));
                    break;

                default:
                    errorMessage = rules[i](inputElement.value);
                    break;
            }
            if (errorMessage) break;
        }
        if (errorMessage) {
            handelCheckInputFalse(inputElement, errorMessage);
        } else {
            handelCheckInputTrue(inputElement);
        }
        return !errorMessage;
    }
    // =========================================================================
    // 1. Lấy giá trị thẻ input
    // =========================================================================
    function handelElementRuleSelector(element) {
        return formElement.querySelectorAll(element.selector);
    }
    // 2. Hàm xử lý lấy các dữ liệu rule
    function handelGetValueRule(rule) {
        let inputElements = handelElementRuleSelector(rule);
        Array.from(inputElements).forEach((inputElement) => {
            let isValid = handelValidate(inputElement, rule);
            return !!isValid;
        });

    }

    // =========================================================================
    // Hàm xử lý khi bấm dữ liệu
    function handelSubmitValueForm(isFormValid) {
        if (isFormValid) {
            if (typeof options.onSubmit === 'function') {
                // Trường hợp submit với javascript
                var enableInputs = formElement.querySelectorAll('input[name]:not([disabled])');
                var formValues = Array.from(enableInputs).reduce(function (values, input) {
                    values[input.name] = input.value;
                    return values;
                }, {});
                options.onSubmit(formValues);
            } else {
                // Trường hợp submit với hành vi mặc định
                formElement.submit();
            }
        }
    }

    // =========================================================================
    // Kiểm tra có giá trị form chưa
    if (formElement) {
        // ======================================================================
        // Sự kiện onClick
        formElement.onsubmit = (e) => {
            e.preventDefault();
            let isFormValid = true;

            // Lặp qua từng rules và validate
            options.rules.forEach((rule) => {
                isFormValid = handelGetValueRule(rule);
            });

            handelSubmitValueForm(isFormValid);
        }
        // ======================================================================
        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input, ...)
        // ======================================================================
        options.rules.forEach((rule) => {

            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                // Gắn giá trị lại cho mỗi lần lặp đầu tiên cho mỗi input
                selectorRules[rule.selector] = [rule.test];
            }

            // ===================================================================
            let inputElements = handelElementRuleSelector(rule);
            Array.from(inputElements).forEach((inputElement) => {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = () => {
                    handelGetValueRule(rule);
                }
                // Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = () => {
                    handelCheckInputTrue(inputElement);
                }
            })
        });
        // ======================================================================

    }
    // ===========================================================================
}

// Định nghĩa các rules
// Nguyên tắc của các rules 
// 1. Khi có lỗi => trả ra message lỗi
// 2. Khi hợp lệ => không trả ra gì cả
// ===============================================================================
// 1. Kiểm tra giá trị đã được nhập hay chưa
Validator.isRequired = (selector, message) => {
    return {
        selector,
        test: (value) => {
            return value ? undefined : message || "Vui lòng nhập trường này";
        }
    };
}
// ===============================================================================
// 2. Kiểm tra giá trị của thuộc tính email
Validator.isEmail = (selector, message) => {
    return {
        selector,
        test: (value) => {
            let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || "Trường này phải là email";
        }
    };
}
// ===============================================================================
// 3. Kiểm tra độ dài của giá trị(0,6)=> là giá trị max||(6)=>là giá trị min||(3,5) => giá trị tổi thiểu là 3 và tối đa là 6
Validator.isLength = (selector, min, max, message) => {
    if (min && max) {
        return {
            selector,
            test: (value) => {
                return min <= value.length && value.length <= max ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự và tối đa ${max}`;
            }
        }
    } else {
        if (min) {
            return {
                selector,
                test: (value) => {
                    return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
                }
            }
        } else {
            return {
                selector,
                test: (value) => {
                    return value.trim() && value.length <= max ? undefined : message || `Vui lòng nhập tối đa ${max} ký tự`;
                }
            }
        }
    }

}
// ===============================================================================
// 4. Kiểm tra nhập lại mật khẩu
Validator.isConfirmed = (selector, getConfirmValue, message) => {
    return {
        selector,
        test: (value) => {
            return value === getConfirmValue() ? undefined : message || "Giá trị nhập vào không chính xác";
        }
    }
}
// ===============================================================================
