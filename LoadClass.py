import os
import re
from enum import Enum
from datetime import datetime

class ParseTool(object):

    @staticmethod
    def pre_format_file(file_path):
        if os.path.exists(file_path) and os.path.isfile(file_path):
            file = open(file_path, 'r', encoding='utf-8', errors='ignore')
            try:
                file_content = file.read()
            except Exception as e:
                try:
                    file = open(file_path, 'r', encoding='ascii', errors='ignore')
                    file_content = file.read()
                except Exception as e:
                    try:
                        file = open(file_path, 'r', encoding='ISO-8859-1', errors='ignore')
                        file_content = file.read()
                    except Exception as e:
                        try:
                            file = open(file_path, 'r', encoding='gbk', errors='ignore')
                            file_content = file.read()
                        except Exception as e:
                            try:
                                file = open(file_path, 'r', encoding='Windows-1252', errors='ignore')
                                file_content = file.read()
                            except Exception as e:
                                print('no compatible encoding with ascii, utf-8, ISO-8859-1, gbk and Windows-1252, please have a self-check. {0}', e)
                            finally:
                                file.close()
                        finally:
                            file.close()
                    finally:
                        file.close()
                finally:
                    file.close()
            finally:
                file.close()

            # 去除注释
            file_content = ParseTool.filter_uneless_chars(file_content)

            # 去除空白行
            cleaned_lines = ParseTool.clean_blank_lines(file_content)
            return cleaned_lines
        else:
            return []

    @staticmethod
    def filter_uneless_chars(file_content):
        # 移除单行注释和多行注释
        def _remove_comments(string):
            pattern = r"(\".*?\"|\'.*?\')|(/\*.*?\*/|//[^\r\n]*$)"
            regex = re.compile(pattern, re.MULTILINE | re.DOTALL)

            def _replacer(match):
                if match.group(2) is not None:
                    return ""
                else:
                    return match.group(1)

            return regex.sub(_replacer, string)

        file_str = _remove_comments(file_content)
        return file_str

    @staticmethod
    def clean_blank_lines(file_content):
        lines = file_content.split('\n')
        cleaned_lines = []
        for line in lines:
            if len(line.strip()) != 0:
                cleaned_lines.append(line)

        return cleaned_lines


target_path = os.path.abspath(".") + "/src"

all_class = []
all_interface = []
count = 0

def loadAllClass(path):
    # 在函数中，如果想给全局变量赋值，则需要用关键字global生命
    global count
    global all_class
    global all_interface
    file_list = os.listdir(path)
    for file in file_list:
        local_path = os.path.join(path, file)
        if os.path.isdir(local_path):
            loadAllClass(local_path)
        else:
            count += 1
            print("第{0}个类, 类名是{1}".format(count, file))
            getClassName(local_path)


def getClassName(file_local):
    file_lines = ParseTool.pre_format_file(file_local)

    if len(file_lines) > 0:
        for line in file_lines:
            if line.startswith('interface'):
                parameter_pattern = re.compile(r'\s+(.*?)\s+')
                matches = re.findall(parameter_pattern, line)
                if matches:
                    for match in matches:
                        all_interface.append(match)
            else:
                parameter_pattern = re.compile(r'^class\s+(.*?)\s+')
                matches = re.findall(parameter_pattern, line)
                if matches:
                    for match in matches:
                        all_class.append(match)
    else:
        return None


def writeToFile(file_name):
    output_path = os.path.join(target_path, file_name)
    f = open(output_path, 'wb')
    f.write(bytes('\n', encoding='utf-8'))
    f.write(bytes('\n', encoding='utf-8'))
    f.write(bytes('//---------------------------\n', encoding='utf-8'))
    f.write(bytes('// desc: 自动将类添加到window里\n', encoding='utf-8'))
    f.write(bytes('// author: Ade\n', encoding='utf-8'))
    f.write(bytes('// since: {0}\n'.format(datetime.now()), encoding='utf-8'))
    f.write(bytes('// copyright: haoyu\n', encoding='utf-8'))
    f.write(bytes('//---------------------------\n', encoding='utf-8'))
    f.write(bytes('\n', encoding='utf-8'))

    f.write(bytes('class LoadAllClass {\n', encoding='utf-8'))

    f.write(bytes('\tpublic static init(): void {\n', encoding='utf-8'))

    for class_name in all_class:
        f.write(bytes('\t\twindow[\"{0}\"] = {1};\n'.format(class_name, class_name), encoding='utf-8'))
    f.write(bytes('\n', encoding='utf-8'))
    f.write(bytes('\t}\n', encoding='utf-8'))
    f.write(bytes('}\n', encoding='utf-8'))
    f.close()


def writeInterface(file_name):
    output_path = os.path.join(target_path, file_name)
    f = open(output_path, 'wb')
    f.write(bytes('\n', encoding='utf-8'))
    f.write(bytes('\n', encoding='utf-8'))
    f.write(bytes('//---------------------------\n', encoding='utf-8'))
    f.write(bytes('// desc: 获取所有interface\n', encoding='utf-8'))
    f.write(bytes('// author: Ade\n', encoding='utf-8'))
    f.write(bytes('// since: {0}\n'.format(datetime.now()), encoding='utf-8'))
    f.write(bytes('// copyright: haoyu\n', encoding='utf-8'))
    f.write(bytes('//---------------------------\n', encoding='utf-8'))
    f.write(bytes('\n', encoding='utf-8'))

    f.write(bytes('class LoadAllInterface {\n', encoding='utf-8'))
    f.write(bytes('\tpublic static interfacelist:[string] = [""];\n', encoding='utf-8'))
    f.write(bytes('\tpublic static init(): void {\n', encoding='utf-8'))
    for interface_name in all_interface:
        f.write(bytes('\t\tLoadAllInterface.interfacelist[\"{0}\"] = \"{1}\";\n'.format(interface_name, interface_name), encoding='utf-8'))
    f.write(bytes('\n', encoding='utf-8'))
    f.write(bytes('\t}\n', encoding='utf-8'))
    f.write(bytes('}\n', encoding='utf-8'))
    f.close()

loadAllClass(target_path)
writeToFile('LoadAllClass.ts')
writeInterface('LoadAllInterface.ts')




