define(['jquery', 'underscore', 'twigjs'], function ($, _, Twig) {
    
    const render_lead = function (self) {        
        var fields = AMOCRM.data.current_card.form.el.getElementsByClassName('linked-form__field linked-form__field-numeric');

        for (const i of fields) {
            pID = i.getAttribute('data-id');
            pTitle = i.firstChild.title;           

            pElem = AMOCRM.data.current_card.form.$el[0].querySelectorAll('input[name="CFV[' + pID + ']"][type="numeric"], .linked-form_cf')[0];

            if ("Слагаемое1" == pTitle) {
                Summand1 = pElem
            };
            if ("Слагаемое2" == pTitle) {
                Summand2 = pElem
            };
            if ("Сумма" == pTitle) {
                Summ = pElem;
                Summ.readOnly = true;
            };
        }

        Summand1.onchange = (e) => {
            s1 = parseFloat(Summand1.value);
            s2 = parseFloat(Summand2.value);
            pVal = (isNaN(s1) ? 0 : s1) + (isNaN(s2) ? 0 : s2);

            Summ.value = pVal;
            //   Summ.setAttribute('value', pVal);
            //   APP.data.current_card.model.attributes[Summ.name] = pVal;
            //   $('#'+Summ.name).data('value',pVal);
            Summ.dispatchEvent(new Event('change', { bubbles: true }));
        };
        Summand2.onchange = Summand1.onchange;

        self.render_template({
            body: '',
            caption: {
                class_name: 'widget-caption-autosum'
            },
            render: '<div class="widget-body-autosum">' +
                '<div>' + 'Сумма:{{sum}}</div>' +
                '<div>' + 'Имя поля слагаемое 1:' + Summand1.title + '(' + Summand1.id + ')' + '=' + Summand1.value + '</div>' +
                '<div>' + 'Имя поля слагаемое 2:' + Summand1.title + '(' + Summand2.id + ')' + '=' + Summand2.value + '</div>' +
                '<div>' + 'Имя поля сумма:' + Summ.title + '(' + Summ.id + ')' + '=' + Summ.value + '</div>' +
                '<div>' + 'Код виджета :' + self.get_settings().widget_code + '</div>' +
                '</div>'
        }, { sum: 13 });
        console.log('render');
    }
    //============================================================================================================================================

    var CustomWidget = function () {
        var self = this;

        this.getTemplate = _.bind(function (template, params, callback) {
            params = (typeof params == 'object') ? params : {};
            template = template || '';

            return this.render({
                href: '/templates/' + template + '.twig',
                base_path: this.params.path,
                v: this.get_version(),
                load: callback
            }, params);
        }, this);

        this.callbacks = {
            render: function () {
                console.log(APP.getWidgetsArea());
                if (APP.getWidgetsArea() == 'leads_card') {
                    render_lead(self);
                }
                return true;
            },
            init: _.bind(function () {
                console.log('init');

                AMOCRM.addNotificationCallback(self.get_settings().widget_code, function (data) {
                    console.log(data)
                });

                this.add_action("phone", function (params) {
                    /**
                     * код взаимодействия с виджетом телефонии
                     */
                    console.log(params)
                });

                this.add_source("sms", function (params) {
                    /**
                     params - это объект в котором будут  необходимые параметры для отправки смс
          
                     {
                       "phone": 75555555555,   // телефон получателя
                       "message": "sms text",  // сообщение для отправки
                       "contact_id": 12345     // идентификатор контакта, к которому привязан номер телефона
                    }
                     */

                    return new Promise(_.bind(function (resolve, reject) {
                        // тут будет описываться логика для отправки смс
                        self.crm_post(
                            'https://example.com/',
                            params,
                            function (msg) {
                                console.log(msg);
                                resolve();
                            },
                            'text'
                        );
                    }, this)
                    );
                });

                return true;
            }, this),
            bind_actions: function () {
                console.log('bind_actions');
                return true;
            },
            settings: function () {

                return true;
            },
            onSave: function () {
                alert('click');
                return true;
            },
            destroy: function () {

            },
            contacts: {
                //select contacts in list and clicked on widget name
                selected: function () {
                    console.log('contacts');
                }
            },
            leads: {
                //select leads in list and clicked on widget name
                selected: function () {
                    console.log('leads');
                }
            },
            tasks: {
                //select taks in list and clicked on widget name
                selected: function () {
                    console.log('tasks');
                }
            },
            advancedSettings: _.bind(function () {
                var $work_area = $('#work-area-' + self.get_settings().widget_code),
                    $save_button = $(
                        Twig({ ref: '/tmpl/controls/button.twig' }).render({
                            text: 'Сохранить',
                            class_name: 'button-input_blue button-input-disabled js-button-save-' + self.get_settings().widget_code,
                            additional_data: ''
                        })
                    ),
                    $cancel_button = $(
                        Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                            text: 'Отмена',
                            class_name: 'button-input-disabled js-button-cancel-' + self.get_settings().widget_code,
                            additional_data: ''
                        })
                    );

                console.log('advancedSettings');

                $save_button.prop('disabled', true);
                $('.content__top__preset').css({ float: 'left' });

                $('.list__body-right__top').css({ display: 'block' })
                    .append('<div class="list__body-right__top__buttons"></div>');
                $('.list__body-right__top__buttons').css({ float: 'right' })
                    .append($cancel_button)
                    .append($save_button);

                self.getTemplate('advanced_settings', {}, function (template) {
                    var $page = $(
                        template.render({ title: self.i18n('advanced').title, widget_code: self.get_settings().widget_code })
                    );

                    $work_area.append($page);
                });
            }, self),
            onSalesbotDesignerSave: function () { },
        };
        return this;
    };

    return CustomWidget;
});