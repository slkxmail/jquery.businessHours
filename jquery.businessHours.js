/**
 jquery.businessHours v1.0.1
 https://github.com/gEndelf/jquery.businessHours

 requirements:
 - jQuery 1.7+

 recommended time-picker:
 - jquery-timepicker 1.2.7+ // https://github.com/jonthornton/jquery-timepicker
 **/

(function($) {
    $.fn.businessHours = function(opts) {
        var defaults = {
            preInit: function() {
            },
            postInit: function() {
            },
            postChange: function() {
            },
            inputDisabled: false,
            resultContainer: false,
            checkedColorClass: "WorkingDayState",
            uncheckedColorClass: "RestDayState",
            colorBoxValContainerClass: "colorBoxContainer",
            weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            operationTime: [
                {},
                {},
                {},
                {},
                {},
                {isActive: false},
                {isActive: false}
            ],
            defaultOperationTimeFrom: '9:00',
            defaultOperationTimeTill: '18:00',
            defaultActive: true,
            //labelOn: "Working day",
            //labelOff: "Day off",
            //labelTimeFrom: "from:",
            //labelTimeTill: "till:",
            containerTmpl: '<div class="clean"/>',
            dayTmpl: '<div class="dayContainer">' +
            '<div data-original-title="" class="colorBox"><input type="checkbox" class="invisible operationState"/></div>' +
            '<div class="weekday"></div>' +
            '<div class="operationDayTimeContainer">' +
            '<div class="operationTime"><input type="text" name="startTime" class="mini-time operationTimeFrom" value=""/></div>' +
            '<div class="operationTime"><input type="text" name="endTime" class="mini-time operationTimeTill" value=""/></div>' +
            '</div></div>'
        };

        var container = $(this);

        function initTimeBox(timeBoxSelector, time, isInputDisabled) {
            timeBoxSelector.val(time);

            if(isInputDisabled) {
                timeBoxSelector.prop('readonly', true);
            }
        }

        var methods = {
            getValueOrDefault: function(val, defaultVal) {
                return (jQuery.type(val) === "undefined" || val == null) ? defaultVal : val;
            },
            init: function(opts) {
                this.options = $.extend(defaults, opts);
                container.html("");

                if(typeof this.options.preInit === "function") {
                    this.options.preInit();
                }

                this.initView(this.options);

                if(typeof this.options.postInit === "function") {
                    //$('.operationTimeFrom, .operationTimeTill').timepicker(options.timepickerOptions);
                    this.options.postInit();
                }

                return {
                    serialize: function() {
                        var data = [];

                        container.find(".operationState").each(function(num, item) {
                            var isWorkingDay = $(item).prop("checked");
                            var dayContainer = $(item).parents(".dayContainer");

                            data.push({
                                isActive: isWorkingDay,
                                timeFrom: isWorkingDay ? dayContainer.find("[name='startTime']").val() : null,
                                timeTill: isWorkingDay ? dayContainer.find("[name='endTime']").val() : null
                            });
                        });

                        return data;
                    }
                };
            },
            serialize: function() {
                var data = [];
                container.find(".dayContainer").each(function(num, item) {
                    var isWorkingDay = $(item).find('.operationState').prop("checked");

                    data.push(JSON.stringify({
                        num: num+1,
                        isActive: isWorkingDay,
                        timeFrom: isWorkingDay ? $(item).find("[name='startTime']").val() : null,
                        timeTill: isWorkingDay ? $(item).find("[name='endTime']").val() : null
                    }));
                });

                return data;
            },

            initView: function(options) {
                var stateClasses = [options.checkedColorClass, options.uncheckedColorClass];
                var subContainer = container.append($(options.containerTmpl));
                var $this = this;

                for(var i = 0; i < options.weekdays.length; i++) {
                    subContainer.append(options.dayTmpl);
                }

                $.each(options.weekdays, function(pos, weekday) {
                    // populate form
                    var day = options.operationTime[pos];
                    var operationDayNode = container.find(".dayContainer").eq(pos);
                    operationDayNode.find('.weekday').html(weekday);

                    var isWorkingDay = $this.getValueOrDefault(day.isActive, options.defaultActive);
                    operationDayNode.find('.operationState').prop('checked', isWorkingDay);

                    var timeFrom = $this.getValueOrDefault(day.timeFrom, options.defaultOperationTimeFrom);
                    initTimeBox(operationDayNode.find('[name="startTime"]'), timeFrom, options.inputDisabled);

                    var endTime = $this.getValueOrDefault(day.timeTill, options.defaultOperationTimeTill);
                    initTimeBox(operationDayNode.find('[name="endTime"]'), endTime, options.inputDisabled);

                    operationDayNode.find('[name="startTime"]').on('change', function() {
                        $this.exportResult();
                    });
                    operationDayNode.find('[name="endTime"]').on('change', function() {
                        $this.exportResult();
                    });

                });

                container.find(".operationState").change(function() {
                    var checkbox = $(this);
                    var boxClass = options.checkedColorClass;
                    var timeControlDisabled = false;

                    if(!checkbox.prop("checked")) {
                        // disabled
                        boxClass = options.uncheckedColorClass;
                        timeControlDisabled = true;
                    }

                    checkbox.parents(".colorBox").removeClass(stateClasses.join(' ')).addClass(boxClass);
                    checkbox.parents(".dayContainer").find(".operationTime").toggle(!timeControlDisabled);
                    $this.exportResult();
                }).trigger("change");

                if(!options.inputDisabled) {
                    // container.find(".colorBox").on("click", function() {
                    //     var checkbox = $(this).find(".operationState");
                    //     checkbox.prop("checked", !checkbox.prop('checked')).trigger("change");
                    // });
                    container.find('[data-toggle="toggle"]').on("click", function() {
                        var checkbox = $(this).find(".operationState");
                        checkbox.prop("checked", !checkbox.prop('checked')).trigger("change");
                        $this.exportResult();
                    });
                }
            }
            ,exportResult: function() {
                var $this = this;
                if($this.options.resultContainer !== false) {
                    $this.options.resultContainer.val($this.serialize());
                }
            },

        };

        return methods.init(opts);
    };
})(jQuery);
