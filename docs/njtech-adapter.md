# 南京工业大学适配说明

本分支针对南京工业大学正方教务系统自主选课页面进行源码级适配：

```text
https://jwgl.njtech.edu.cn/xsxk/zzxkyzb_cxZzxkYzbIndex.html
```

## 已核对的页面结构

根据南京工业大学选课页面实际加载的 `zzxkYzb.js` 与 `zftal-ui.css`，以下结构与脚本匹配：

| 功能 | 页面结构 |
| --- | --- |
| 课程列表 | `.tjxk_list` |
| 课程标题 | `.panel-heading.kc_head` |
| 课程内部编号 | `input[name="kch_id"]` |
| 教学班名称 | `.jxbmc` |
| 教师信息 | `.jsxm`、`.jszc`、`.jsxmzc` |
| 上课时间 | `.sksj` |
| 已选人数与容量 | `.jxbrs`、`.jxbrl`、`.rsxx` |
| 教学班编号 | `.jxb_id` |
| 选课按钮 | `td.an button[id^="btn-xk-"][onclick*="chooseCourseZzxk"]` |
| 已选课程区域 | `.outer_xkxx_list`、`[id^="right_"]` |
| 退选按钮 | `button[onclick*="cancelCourseZzxk"]` |
| 确认弹窗 | `.bootbox`、`.modal` |

## 南工大专用保护

脚本在 `jwgl.njtech.edu.cn` 上会自动启用以下配置：

- 检查间隔改为 `3000ms`；
- 最大尝试次数改为 `1000`；
- 默认关闭多课程并发；
- 每 `5` 次检查才刷新一次课程列表；
- 选课按钮只精确匹配 `chooseCourseZzxk`，避免误点“预定教材”等操作；
- 退选按钮优先精确匹配 `cancelCourseZzxk`；
- `#iskxk` 不为 `1` 时直接提示选课未开放，不启动轮询；
- 没有加载 `.panel-heading.kc_head` 时提示先搜索课程。

可以在控制台查看当前识别结果：

```javascript
grab.config.getPlatform()
```

预期输出：

```javascript
{
  id: "njtech",
  name: "南京工业大学",
  checkInterval: 3000,
  maxAttempts: 1000,
  concurrentEnabled: false,
  refreshEveryAttempts: 5
}
```

## 使用要求

1. 登录教务系统并进入“自主选课”。
2. 使用课程号搜索目标课程。
3. 确认课程卡片已经显示后再加载脚本。
4. 第一次测试只添加一门课程，不填写“替换课程”。
5. 先执行 `grab.debug("课程号")` 检查教学班、教师、时间和容量识别结果。
6. 只有在学校规则允许且调试结果正确时才启动。

## 当前验证范围

当前完成的是静态源码与 DOM 结构验证。由于采集源码时选课窗口关闭，尚未进行真实选课操作验证，因此不能标记为“完整实测通过”。

禁止在兼容性报告中提交账号、密码、Cookie、Token、学号、姓名、课程名单或未脱敏请求数据。
