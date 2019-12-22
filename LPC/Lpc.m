classdef Lpc < matlab.apps.AppBase

    % Properties that correspond to app components
    properties (Access = public)
        LPCUIFigure  matlab.ui.Figure
        Button1      matlab.ui.control.Button
        Button2      matlab.ui.control.Button
        Label        matlab.ui.control.Label
        TextArea     matlab.ui.control.TextArea
        UIAxes       matlab.ui.control.UIAxes
    end

    
    properties (Access = private)
        recorder % audiorecorder
    end
    
    methods (Access = private)
        
    end
    

    % Callbacks that handle component events
    methods (Access = private)

        % Code that executes after component creation
        function startupFcn(app)
            app.recorder = audiorecorder(16000, 16, 1);
        end

        % Button pushed function: Button1
        function Button1Pushed(app, event)
            app.TextArea.Value = '正在录音, 录制完成请点击停止录音';
            % 开始录音
            record(app.recorder);
        end

        % Button pushed function: Button2
        function Button2Pushed(app, event)
            % 停止录音
            stop(app.recorder);
            % 回放录音数据
            play(app.recorder);
            % 获取录音数据
            recording = getaudiodata(app.recorder);
            % 绘制录音数据波形
            plot(app.UIAxes, recording);
            % 储存录音为文件
            audiowrite('record.wav', recording, 16000);
            % 进行LPC编码
            encode
            app.TextArea.Value = '已停止录音, 请播放对比原录音音频record.wav和经过LPC编码后的encode.wav';
        end
    end

    % Component initialization
    methods (Access = private)

        % Create UIFigure and components
        function createComponents(app)

            % Create LPCUIFigure and hide until all components are created
            app.LPCUIFigure = uifigure('Visible', 'off');
            app.LPCUIFigure.Position = [100 100 712 612];
            app.LPCUIFigure.Name = 'LPC';
            app.LPCUIFigure.Resize = 'off';

            % Create Button1
            app.Button1 = uibutton(app.LPCUIFigure, 'push');
            app.Button1.ButtonPushedFcn = createCallbackFcn(app, @Button1Pushed, true);
            app.Button1.Position = [362 514 100 24];
            app.Button1.Text = '开始录音';

            % Create Button2
            app.Button2 = uibutton(app.LPCUIFigure, 'push');
            app.Button2.ButtonPushedFcn = createCallbackFcn(app, @Button2Pushed, true);
            app.Button2.Position = [526 514 100 24];
            app.Button2.Text = '停止录音';

            % Create Label
            app.Label = uilabel(app.LPCUIFigure);
            app.Label.HorizontalAlignment = 'right';
            app.Label.Position = [13 563 53 22];
            app.Label.Text = '运行状态';

            % Create TextArea
            app.TextArea = uitextarea(app.LPCUIFigure);
            app.TextArea.Position = [81 467 227 118];

            % Create UIAxes
            app.UIAxes = uiaxes(app.LPCUIFigure);
            title(app.UIAxes, '录音数据波形')
            xlabel(app.UIAxes, 'X')
            ylabel(app.UIAxes, 'Y')
            app.UIAxes.TitleFontWeight = 'bold';
            app.UIAxes.Position = [21 15 672 436];

            % Show the figure after all components are created
            app.LPCUIFigure.Visible = 'on';
        end
    end

    % App creation and deletion
    methods (Access = public)

        % Construct app
        function app = Lpc

            % Create UIFigure and components
            createComponents(app)

            % Register the app with App Designer
            registerApp(app, app.LPCUIFigure)

            % Execute the startup function
            runStartupFcn(app, @startupFcn)

            if nargout == 0
                clear app
            end
        end

        % Code that executes before app deletion
        function delete(app)

            % Delete UIFigure when app is deleted
            delete(app.LPCUIFigure)
        end
    end
end