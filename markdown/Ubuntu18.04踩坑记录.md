![welcome / home](https://upload-images.jianshu.io/upload_images/3019242-7632da3ebbcad605.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## > Contents
__________
* Wine应用启动后出现WineSystemTray 托盘的问题
* 中文环境下将Home目录下的文件夹切换为英文名
* Ubuntu系发行版安装deepin wine QQ
* 续：安装QQ/微信
* Ubuntu 18.04开机启动特别慢的问题
* 终端oh-my-zsh配置
* vim插件配置
* Ubuntu18.04 定制Mac主题
* Ubuntu18.04 自己定制 登录、锁屏界面的图片和样式
* Ubuntu18.04 关于定制plymouth主题来更换开机动画
* Ubuntu18.04 使用[Dash to dock]插件时同时出现两个dock的问题
* Ubuntu18.04 添加软件源提示：没有Release文件，忽略源的问题
* Ubuntu18.04 解决一些软件依赖不满足问题的问题
* Linux分区过小导致后期容量不足解决方法
* Shadowsocks-Qt5安装的问题
* 使用polipo开启终端代理(需要先开启shadowsocks代理)
* 将linux绿色解压版软件包或自定义脚本显示到应用菜单图标列表
* 自定义shadowsocks服务开机自启动脚本
* Ubuntu18.04设置shadowsocks全局pac自动代理对浏览器无效
* Atom编辑器内存占用过大的问题
* Grub2 主题安装
* Ubuntu18.04 解决下载额外数据文件失败：ttf-mscorefonts-installer
* Win10 + Ubuntu18.04 双系统时间显示不对
* Ubuntu18.04 安装系统时说明(双硬盘)
* Ubuntu 18.04 使用lvm逻辑卷管理方式安装后启动很慢的问题
* Ubuntu18.04 安装网易云音乐1.1.0后不能打开的解决方法
* Ubuntu18.04 Crossover17安装QQ后乱码的解决方法
* Ubuntu18.04 通过tweak安装gnome插件Blyr后设置插件报错
* Ubuntu18.04 Gnome-Shell 插件
* Ubuntu18.04 插件 [ Dash to dock ] 一些常用设置
* Ubuntu18.04 主题
* chrome实用插件整理
* 实用程序和命令
* 实用网站推荐

#### Wine应用启动后出现WineSystemTray托盘的问题
____________________________________________
![wine_tray.png](https://upload-images.jianshu.io/upload_images/3019242-1f62afa75df79ab9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![tray.png](https://upload-images.jianshu.io/upload_images/3019242-6121a50df5b57569.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
1. 操作系统Linux Mint18.3
右键点击面板(状态栏)，选择 - 向面板添加小程序，选择小程序 - 系统托盘，点击+号添加，之后Wine安装的应用和其它应用的图标就被系统托盘管理了。

2. 操作系统Ubuntu 18.04
安装gnome-shell插件 [TopIcons](https://extensions.gnome.org/extension/495/topicons/), 要想从浏览器上安装这个TopIcons需要先安装浏览器gnome交互插件chrome-gnome-shell (`sudo apt install chrome-gnome-shell` )，使用deepin QQ的时候可能需要重新启动TopIcons才能显示顶部QQ图标。

#### 中文环境下将Home目录下的文件夹切换为英文名
-------------------------------------------------------------------------
1.  设置英文语言环境
```sh
$: export LANG=en_US(恢复-> zh_CN)
```
2. 更新目录
```sh
$: xdg-user-dirs-gtk-update
```
3. 弹出提示框点击 [确认]
4. 重启后会再次弹出提示框是否将英文文件夹改回中文，选择 [不再提示] 并 [取消] 修改

#### Ubuntu系发行版安装deepin wine QQ
__________________________________

1. 安装deepin-wine环境：上[https://gitee.com/wszqkzqk/deepin-wine-for-ubuntu](https://gitee.com/wszqkzqk/deepin-wine-for-ubuntu)页面下载zip包（或用git方式克隆），也可以[百度网盘](https://pan.baidu.com/s/120C5aHuqtyxQyn_fGTxHKg)下载，解压到本地文件夹，在文件夹中打开终端，输入`sudo sh ./install.sh`一键安装，如果你安装了这些依赖，在第二步的时候仍然报依赖错误，那就手动解压deb包，把那些依赖声明删除就行了(解压deb的方法下文中有提到)。

2. 安装deepin.com应用容器：在[http://mirrors.aliyun.com/deepin/pool/non-free/d/](http://mirrors.aliyun.com/deepin/pool/non-free/d/)中下载想要的容器，点击deb安装即可，以下为推荐容器:
*   QQ：[http://mirrors.aliyun.com/deepin/pool/non-free/d/deepin.com.qq.im/](http://mirrors.aliyun.com/deepin/pool/non-free/d/deepin.com.qq.im/)
*   TIM：[http://mirrors.aliyun.com/deepin/pool/non-free/d/deepin.com.qq.office/](http://mirrors.aliyun.com/deepin/pool/non-free/d/deepin.com.qq.office/)
*   QQ轻聊版：[http://mirrors.aliyun.com/deepin/pool/non-free/d/deepin.com.qq.im.light/](http://mirrors.aliyun.com/deepin/pool/non-free/d/deepin.com.qq.im.light/)
*   微信：[http://mirrors.aliyun.com/deepin/pool/non-free/d/deepin.com.wechat/](http://mirrors.aliyun.com/deepin/pool/non-free/d/deepin.com.wechat/)
*   Foxmail：[http://mirrors.aliyun.com/deepin/pool/non-free/d/deepin.com.foxmail/](http://mirrors.aliyun.com/deepin/pool/non-free/d/deepin.com.foxmail/)
*   百度网盘：[http://mirrors.aliyun.com/deepin/pool/non-free/d/deepin.com.baidu.pan/](http://mirrors.aliyun.com/deepin/pool/non-free/d/deepin.com.baidu.pan/)
*  360压缩：http://mirrors.aliyun.com/deepin/pool/non-free/d/deepin.cn.360.yasuo/
*  迅雷急速版:  https://pan.baidu.com/s/1cij1FhFeEn2sXdPtkJ3lSg
* Ubuntu系发行版包括Ubuntu、LinuxMint、ZorinOS等。

#### 续：安装QQ/微信
______________________
* 人民币￥140买个CrossOver17正版，一次激活，永久使用，然后愉快地安装QQ8.9，喜欢TIM的也能用TIM， 不过目前这个基于crossover的bug比较多，经常自己就崩溃了，也不能记住密码。
* linux上的微信大部分都是网页版微信封装的: [electronic-wechat](https://github.com/geeeeeeeeek/electronic-wechat)、[weweChat](https://github.com/trazyn/weweChat)，网页版功能简单，每次登录都要扫码。最好使用deepin wine上的微信，功能强大，跟windows版本一样。

#### Ubuntu 18.04开机启动特别慢的问题
_________________________________
=> 禁用不必要的开机服务：
```sh
# 列出程序开机占用时间排行
systemd-analyze blame
# 禁用plymouth
sudo systemctl mask plymouth-start.service
sudo systemctl mask plymouth-read-write.service
```
#### 终端oh-my-zsh配置
_________________________________
1. 主题
* ys (已使用)
* avit
* af-magic
2. 插件
* git => 自带git状态插件
* svn => svn状态插件
* colored-man-pages => man帮助信息高亮
* zsh-syntax-highlighting => 命令高亮和错误提示
* z => 自动记录路径快捷跳转
* zsh-autosuggestions => 根据输入记录自动建议可选输入命令

#### vim插件配置
______________
1. [Vundle](https://github.com/VundleVim/Vundle.vim) => 插件管理器，编辑.vimrc，然后执行命令`vim +PluginInstall`即可安装  
2. [vim-airline](https://github.com/vim-airline/vim-airline) => 底部状态栏  
3. [其他配置](https://juejin.im/post/5a38c37f6fb9a0450909a151)

#### Ubuntu18.04 定制Mac主题
__________________________
![thunder_qq_baidu.png](https://upload-images.jianshu.io/upload_images/3019242-72be25731510c870.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![overview.png](https://upload-images.jianshu.io/upload_images/3019242-bea700f5d28f6dc6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![desktop.png](https://upload-images.jianshu.io/upload_images/3019242-9d2a491b512d8ef5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


1. 安装gnome-tweak-tool 和 chrome-gnome-shell 插件 (`sudo aptitude install [name]`)
2. 安装GTK3主题 => [X-Arc-Collection](https://www.gnome-look.org/p/1167049/)
3. 使用tweak载入应用程序主题 => tweak -- 外观 -- 应用程序 -- 选择X-Arc-Collection
4. 安装gnome-shell 主题 => [macOS High Sierra](https://www.gnome-look.org/p/1167049/)
5. 安装gnome-shell 插件 => [User Themes](https://extensions.gnome.org/extension/19/user-themes/) ( 之后重启Gnome => [Alt + F2] & [输入 r] & [点击 Enter] )
6. 使用tweak载入shell主题 => tweak -- 外观 -- shell -- 选择Sierra shell主题
7.  下载Mac图标主题 [la-capitaine-icon-theme](https://github.com/keeferrourke/la-capitaine-icon-theme/releases)
8. 图标文件夹移动到 ~/.icons目录下(没有则新建目录)
9. 使用tweak载入icon主题 => tweak -- 外观 -- 图标 -- 选择对应的图标主题
10. 安装gnome-shell插件 => Dash to dock (将原生dock转变为可定制的浮动dock)
11. __Congratulation!  You got an Mac-OS interface on ubuntu 18.04.__
12. [参考文章1](https://zhuanlan.zhihu.com/p/37852274) /  [参考文章2](https://imcn.me/html/y2016/26832.html)

#### Ubuntu18.04 自己定制 登录、锁屏界面的图片和样式
--------------------------------------------------------------------------------------------
![lockscreen.png](https://upload-images.jianshu.io/upload_images/3019242-a64f6f7c07ab0a1e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![loginscreen.png](https://upload-images.jianshu.io/upload_images/3019242-394fd692233cd1f6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1. 安装脚本 => [github / nojsja / login-manager-config-ubuntu](https://github.com/NoJsJa/maintenance/tree/master/code/shell/desktop/login-manager-config-ubuntu)  
2. 说明=> 脚本通过更改/usr/share/gnome-shell/theme/ubuntu.css文件中声明的样式来修改系统登录页面按钮布局和背景图片的地址，使用ImageMagick包的`convert -blur`命令制作了毛玻璃效果的登录背景图片，最后还生成了一个SetAsWallpaper脚本，可以在文件夹中的图片文件上右键点击选择运行这个脚本(它会自动把目标图片更改成桌面壁纸和毛玻璃效果化的登录背景图)，最后锁屏壁纸需要用户手动安装`gnome-tweak-tool`进行更改。  
3. 之前我想通过更改`/usr/share/gnome-shell/theme/gdm3.css`文件来修改样式，可是发现ubuntu18.04下总会有这样那样的问题。
4. 注意=> 不要贸然尝试更改系统主题的CSS样式文件，如果修改的文件有语法错误或是其它原因，很可能会造成系统开机后无法登入图形界面(出现这种情况可以插入U盘登录PE系统然后挂载原系统的硬盘，最后将错误文件改回即可)。

#### Ubuntu18.04 关于定制plymouth主题来更换开机动画
-----------------------------------------------------------------------------
>其实我不建议去改开机动画，一个原因是ubuntu自己的开机动画就挺美观简洁的，第二个原因是这个东西如果改出问题了卡在开机画面到时候恢复起来比较麻烦，如果执意想去折腾的话，可以去[gnome-look](https://www.gnome-look.org/browse/cat/108/)看看，有很多自己定制的主题和更改教程，不过不一定适合ubuntu18.04，其中一个很大的区别就是ubuntu18.04的plymouth主题存放目录是`/usr/share/plymouth/themes/`，而不是之前版本的`/lib/plymouth/themes/`。如果你想直接更改ubuntu的默认主题文件，可行性还相对较高，因为可以先做个备份，如果改了真的卡在开机画面的话还可以进入U盘的PE系统，把ubuntu文件系统挂载后，再用备份文件恢复原样 => [一篇参考](https://blog.csdn.net/mutilcam_prince/article/details/78299628)

#### Ubuntu18.04 使用[Dash to dock]插件时同时出现两个dock的问题
---------------------------------------------------------------------------------------------
>解决方法是去tweak设置里关闭[Dash to dock]的开关，别担心，关闭后，[Dash to dock]仍然正常工作，但是再也不会同时出现两个dock栏的尴尬情况了。  

![dock-noise.png](https://upload-images.jianshu.io/upload_images/3019242-3a9630451042f241.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![dock-single.png](https://upload-images.jianshu.io/upload_images/3019242-9126548febe2e407.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![dock-tweak.png](https://upload-images.jianshu.io/upload_images/3019242-1a0694d56a4ed2e3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### Ubuntu18.04 添加软件源提示：没有Release文件，忽略源的问题
________________________________________________________
![source.png](https://upload-images.jianshu.io/upload_images/3019242-9f1d06791873819d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1. 打开 软件与更新
2. 选择那个源点击编辑
3. 更改 发行版 信息 (请在网页上查看这个源的仓库文件内的dists目录下有哪些发行版)

#### Ubuntu18.04 解决一些软件依赖不满足问题的问题
____________________________________________
=> 以Ubuntu18.04安装16.04版本网易云音乐为例
```ssh
# gdebi安装包
$: sudo gdebi netease-cloud-music_1.0.0_amd64_ubuntu16.04.deb
$: Dependency is not satisfiable: libqt5libqgtk2
# Ubuntu18.04报出依赖问题，原因是libqt5libqgtk2已经被新的库qt5-style-plugins替代，
# 软件源里找不到这个库，当然我们也能手动安装libqt5libqgtk2，但是很可能会就此引出新的依赖问题
```
=> 方法：解压安装包修改依赖项并重新打包
=> 步骤：
1. deb包同级目录下创建文件夹
```ssh
$: mkdir netease-cloud-music
```
2. 解压安装包到这个文件夹中
```ssh
$: dpkg -X netease-cloud-music_1.0.0_amd64_ubuntu16.04.deb netease-cloud-music
```
3. 解压控制信息
 ```ssh
$: dpkg -e netease-cloud-music_1.0.0_amd64_ubuntu16.04.deb neteas-cloud-music/DEBIAN/
```
4. 修改依赖文件(把libqt5libqgtk2修改为qt5-style-plugins)
```ssh
# vim编辑文件
$: vim neteas-cloud-music/DEBIAN/control
# 使用vim正则对libqt5libqgtk2进行搜索替换
:1,$s/libqt5libqgtk2/qt5-style-plugins/g
# 或是手动查找Depends那一行中声明的libqt5libqgtk2进行替换替换即可
```
5. 生成新的安装包
```ssh
$: dpkg-deb -b neteas-cloud-music
$: mv neteas-cloud-music.deb netease-cloud-music_1.0.0_amd64_ubuntu18.04.deb
```
6. 安装
```ssh
# 使用gdebi或dpkg进行安装即可
$: sudo gdebi netease-cloud-music_1.0.0_amd64_ubuntu18.04.deb
$: sudo dpkg -i netease-cloud-music_1.0.0_amd64_ubuntu18.04.deb
```

#### Linux分区过小导致后期容量不足解决方法
=> 之前安装ubuntu 18.04的时候/var 分区只给了 1.5G，结果现在不够用了

* 方法1
```sh
$: sudo apt-get clean
$: sudo apt-get autoremove
```
如果仍然空间不足，使用方法2。
* 方法2
建立目录软链接解决(软链接和硬链接了解一下)：
```sh
# 以/var目录为例 将占用过大的文件夹移出
$: mv /var/lib /opt
# 建立opt下的lib内目录的软链接到var目录
$: sudo ln -s /opt/lib /var
```
* 方法3
如果/var没有单独分区，则系统默认共享使用/home目录，若此时提示/var空间不足，则说明/home空间不足，这种情况，建议重新安装系统，重新规划分区结构。一般来说，/var目录2G-4G为好，或者不分区，共享/home。

#### Shadowsocks-Qt5安装的问题
________________________
> shadowsocks的GUI版本，用Qt写的，还行，不过我喜欢用sslocal命令脚本来连接服务器，开机自启动，很方便。顺带写个安装流程，不过会遇到我上面提到的 __软件源提示没有Release文件的问题__，可以通过上面的方法解决，这里需要将shadowdocks-Qt5发行版信息更改为`artful`，改为其它发行版可能会遇到依赖问题，遇到依赖问题多尝试几个，还有两行配置文件都要改额。  

\> sudo add-apt-repository ppa:hzwhuang/ss-qt5  
\> sudo apt update  
\> sudo apt-get install shadowsocks-qt5  

#### 使用polipo开启终端代理(需要先开启shadowsocks代理)
________________________________________________
* 安装脚本(适合于bash和zsh终端) => [github / nojsja / polipo-install-config.sh"](https://github.com/NoJsJa/maintenance/tree/master/code/shell/desktop/shadowsocks-terminal)
* 使用方式  
\> 说明：' hp ' == ' http_proxy=http://localhost:8123 ' for any command  
\> 说明：' gp ' == 'http.proxy=localhost:8123' for git proxy config  
\> 使用1：`hp curl ip.gs`
\> 使用2：`git clone https://android.googlesource.com/tools/repo --config $gp`
* 如果polipo启动报错的话(通过`systemctl status polipo`查看)，可能是你的垃圾清理软件删除了polipo的日志文件夹，你可以手动更改polipo配置文件(`/etc/polipo/config`)禁用日至记录功能
#### 将linux绿色解压版软件包或自定义脚本显示到应用菜单图标列表
_______________________________________________________
>很多软件只有解压版，虽然可以解压后发送快捷方式到桌面，但是没有图标，应用列表也看不了。

=> 安装脚本(测试环境ubuntu18.04) => [github / nojsja / makeIconLink](https://github.com/NoJsJa/maintenance/tree/master/code/shell/desktop/application)
=> 使用方式
* 安装之前：请先将需要作为图标的icon图片(比例1:1比较适合，分辨率最好大于64px % 64px)放入目标文件夹内
* 查看说明：
```sh
$: bash makeIconLink --help
```
* 安装指令：
```sh
$: bash makeIconLink --dir /path/to/[exec-file] --target [exec-file-name] --icon [icon-file-name]
```
* 卸载指令：
```sh
$: bash makeIconLink --uninstall [exec-file-name]
```

#### 自定义shadowsocks服务开机自启动脚本
-------------------------------------------------------------
> 使用systemd来管理shadowsocks服务，开机自启动，不用打开shadowsocks-qt5软件，FQ了无痕 ~

=> 我的服务脚本：[startup.sh](https://github.com/NoJsJa/maintenance/blob/master/code/shell/desktop/startup.sh)、[shadowsocks](https://github.com/NoJsJa/maintenance/blob/master/code/shell/desktop/shadowsocks)  
=> 步骤：

* 编写shadowsocks service脚本文件，比如shadow.service

```sh
[Unit]
# 描述
Description=Shadowsocks Service

[Service]
Type=oneshot
# 服务 start/stop 执行脚本(具体执行路径根据自己的目录更改)
ExecStart=/bin/bash /home/nojsja/github/maintenance/code/shell/desktop/startup.sh start
ExecStop=/bin/bash /home/nojsja/github/maintenance/code/shell/desktop/startup.sh stop
RemainAfterExit=yes

[Install]
# 一些简单的依赖信息
WantedBy=multi-user.target
```

* 将服务配置文件放到`/etc/systemd/system`下  
\> sudo cp shadow.service /etc/systemd/system
* 设置服务自启动  
\> systemctl enable shadow
* 服务开启和关闭  
\> systemctl start shadow  
\> systemctl stop shadow

#### Ubuntu18.04设置shadowsocks全局pac自动代理对浏览器无效
________________________
=> 先来一个shadowsocks全局pac代理的步骤：
```sh
# pip需要先安装
$: sudo apt-get install python-pip python-dev build-essential
$: sudo pip install --upgrade pip
$: sudo pip install --upgrade virtualenv
# 安装pac自动生成程序
$: sudo pip install genpac
# 生成pac文件
$: mkdir ~/shadowsocks
$: cd shadowsocks
# proxy配置中的地址和端口具体要看你的shadowsocks连接配置
$: genpac --proxy="SOCKS5 127.0.0.1:1080" --gfwlist-proxy="SOCKS5 127.0.0.1:1080" -o autoproxy.pac --gfwlist-url="https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt"
```
以上操作会在~/shadowsocks目录下生成autoproxy.pac配置文件，到系统设置 -> 网络 -> 网络代理 -> 自动 -> 填入file:///path/to/autoproxy.pac(上面我们生成的pac文件路径)，如果要新增被代理网站的话就自己编辑pac文件，在里面的域名列表里面再添加新的域名就好了。
=> 再写一个脚本[genpac-command](https://github.com/NoJsJa/maintenance/tree/master/code/shell/desktop/shadowsocks/genpac)，可以用来添加用户过滤规则(user-rules.txt) 和在线更新autoproxy.pac代理文件
```sh
# # 在脚本目录下执行
# 显示帮助信息
$: bash genpac-command --help
# 在线更新
$: bash genpac-command --update-online
# 从本地user-rules.txt文件读取更新
$: bash genpac-command --update-local
# 添加自定义规则
$: bash genpac-command --add-rules opendesktop.org
# 添加多个自定义规则
$: bash genpac-command --add-rules opendesktop.org atom.io
# 删除自定义规则
$: bash genpac-command --del-rules opendesktop.org
# 删除多个自定义规则
$: bash genpac-command --del-rules opendesktop.org atom.io
```
=> __不过我遇到了代理pac文件配置好后，firefox和google浏览器仍然不能FQ的情况，仔细排查原因，我发现因为之前我不是用的pac全局代理，是通过浏览器的SwitchOmega插件来手动代理的，这个插件会接管浏览器的网络代理权限，我们需要到浏览器设置里面把网络代理设置为系统代理，以火狐浏览器为例：__
![firefox_proxy.png](https://upload-images.jianshu.io/upload_images/3019242-e478210d6ce4fcc8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### Atom编辑器内存占用过大的问题
______________________________
>Atom、Vscode、Sublime、Bracks都用过，Atom用着最爽，可定制化程度最高。但是有时候用着Atom电脑呼呼作响，查看系统占用，Atom内存占用达到过4、5个G，我的天！其实Atom出现内存泄漏的问题都不是Atom本身的问题，一定是你安装的哪个插件导致了内存泄漏，查看占用信息后定位到atom的插件，然后把它禁用就可以了，比如之前导致我出现这个问题的插件就是：ide-typescript，禁用之后现在基本一个Atom进程只占用200~400Mb左右，取决于你安装的其它插件。还有Atom要经常手动更新啊，仓库里面更新不了的，直接去Atom git仓库下载release正式版本，基本上一个大版本就要更新一次。

#### Grub2 主题安装
_________________
![Vimix.png](https://upload-images.jianshu.io/upload_images/3019242-3d400e0326427464.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
>Grub2就是引导操作系统启动的东西，开机的时候如果是多系统，就会显示多系统的启动菜单，如图，这个启动菜单可以自定义主题。

1. 解压下载的主题文件 => [Vimix](https://pan.baidu.com/s/1ioMub2JmHlIzHJbS2_2gRQ)，得到Vimix文件夹(这里提供我用的一个主题，也可以自已去下载其它主题)
2. 在/boot/grub里创建GRUB2主题目录themes
\> sudo mkdir -p /boot/grub/themes
3. 将下载的Vimix文件夹整体复制到/boot/grub/themes文件夹下
\> sudo cp -r Vimix /boot/grub/themes
4. 修改/etc/default/grub配置文件
\> sudo gedit /etc/default/grub
在文件最后添加：GRUB_THEME="/boot/grub/themes/Vimix/theme.txt" 并保存
5. 更新GRUB
\> sudo update-grub
6. 重启即生效(如果重启卡住请强制关机后再启动)

#### Ubuntu18.04 解决下载额外数据文件失败：ttf-mscorefonts-installer
_________________________________________________________
![ttf.png](https://upload-images.jianshu.io/upload_images/3019242-ea6c22ed54d4a7fe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1. [sourceforge](http://sourceforge.net/projects/corefonts/files/the%20fonts/final/)下载如图所示11个exe文件并放入一个文件夹，比如： /home/nojsja/Downloads/ttf-mscorefonts-installer
2. 运行字体配置程序
\> sudo dpkg-reconfigure ttf-mscorefonts-installer
3. 在配置窗口中输入刚才保存exe的路径确定即可，比如： /home/nojsja/Downloads/ttf-mscorefonts-installer

#### Win10 + Ubuntu18.04 双系统时间显示不对
______________________________________
>Ubuntu和Windows默认的时间管理方式不同，所以双系统发生时间错乱是正常的。Ubuntu默认时间是把BIOS时间当成GMT+0时间，也就是世界标准时，而我国在东八区(GMT+8)，所以如果你的Ubuntu位置是中国的话你系统显示的时间就是BIOS时间+8小时。假如现在是早上8点，那么你Ubuntu会显示8点，这时BIOS中的时间是0点。而当你切换到Windows系统时就会发生时间错乱，因为Windows会认为BIOS时间就是你的本地时间，结果就是Windows显示时间为0点……而假如你在Windows下同步时间，恢复显示为8点，这时BIOS时间也会被Windows改写成8点，再次进入Ubuntu时显示时间又变成了8+8=16点。

1. 先在Ubuntu下更新一下时间
\> sudo apt-get install ntpdate
\> sudo ntpdate time.windows.com
2. 将时间更新到硬件上
\> sudo hwclock --localtime --systohc
3. 关闭linux重新进入windows系统，发现时间正常了

#### Ubuntu18.04 安装系统时说明(双硬盘)
______________________________________________
> 主要分为 [ _GPT磁盘分区+UEFI引导方案_ ] 和 [ _传统MBR磁盘分区 + LEGANCY引导方案_ ]
1. 方案一(兼容方案 gpt+uefi / mbr+legancy)
使用UEFI模式安装Ubuntu18.04时可以选择用 兼容bios启动方式 来安装系统(同时兼容传统启动方式和UEFI启动方式)，即不分配"/boot "分区，分配一个大小为1GB左右的"保留bios启动区域"(UEFI模式会自动挂载/boot和/boot/efi)，其它分区至少还需要一个根分区"/"，8G内存的情况下最好还是分配8G的swap交换分区，另外除了"保留bios启动区域"为主分区，其它分区均为逻辑分区，最后一步很重要 -- 格式化每个分区，要不然安装很可能会出错！[参考](https://blog.csdn.net/jesse_mx/article/details/61425361
)
2. 方案二(gpt+uefi 已使用方案)
创建"efi系统分区"，同时不需要划分"/boot"分区(boot引导是grub由引导的，而efi显然是UEFI引导的)，其余至少还需要划分"/"根分区，除了根分区所有分区都为逻辑分区，最后选择"安装启动引导器的设备"为刚才创建的"efit系统分区"。
3. 方案三(传统mbr+legancy方案)
传统的legancy + mbr的安装，至少划分"/boot"分区(主分区) 和 "/"根分区，其余的分区按需划分，最后选择"安装启动引导器的设备"为创建的"/boot"挂载点。

#### Ubuntu 18.04 使用lvm逻辑卷管理方式安装后启动很慢的问题
[=> 原帖子](https://askubuntu.com/questions/1030867/how-to-diagnose-fix-very-slow-boot-on-ubuntu-18-04)
1. 编辑文件 `/etc/default/grub` 的 `GRUB_CMDLINE_LINUX_DEFAULT` 这一行，加入一个参数__noresume__
```sh
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash noresume"
```
2. 更新grub
```sh
$: sudo update-grub
```
3. 重启电脑

#### Ubuntu18.04 安装网易云音乐1.1.0后不能打开的解决方法
_________________________________________________
* 使用root权限命令行后台启动并且屏蔽输出
\> sudo netease-cloud-music > /dev/null 2>&1  &
* 规避session-manager引起的bug
\> alias netease='unset SESSION_MANAGER && netease-cloud-music'
\> netease > /dev/null &
* 别用那个鸡肋的客户端了，有bug也不更新，上这个酷酷的第三方客户端[ieaseMusic](https://github.com/trazyn/ieaseMusic)
* 这里还有个别人做的针对ubuntu18.04的[重新构建版本](https://github.com/innoob/netease-cloud-music)，可以正常使用，也没有重复登录的bug


#### Ubuntu18.04 Crossover17安装QQ后乱码的解决方法
______________________________________________
>原因：原来的ume-ui-gothic.ttf不支持很多简体中文字符  

使用其它字体文件替换到目录 /opt/cxoffice/share/wine/fonts 下的[ume-ui-gothic.ttf](https://pan.baidu.com/s/13CDBKrvTAJOhrbuyLw96jA)字体文件 (同名)，记得将下好的文件重命名为ume-ui-gothic.ttf。

#### Ubuntu18.04 通过tweak安装gnome插件Blyr后设置插件报错
_______________________________________________________
=> 错误信息：`Error: Requiring Clutter, version none: Typelib file for namespace 'Clutter' (any version) not found ...`  
=> 原因分析：该插件需要的依赖Clutter尚未安装
=> 解决方法：
```sh
# 安装依赖
$: sudo apt-get install gir1.2-clutter-1.0 gir1.2-clutter-gst-3.0 gir1.2-gtkclutter-1.0
```

#### Ubuntu18.04 Gnome-Shell 插件
______________________________________________
* [CoverFlow Alt-Tab](https://extensions.gnome.org/extension/97/coverflow-alt-tab/) => 窗口Tab切换预览(★★★★☆)
* [User Themes(必要)](https://extensions.gnome.org/extension/19/user-themes/) => 用户主题安装(★★★★★)
* [Dash To Dock](https://extensions.gnome.org/extension/307/dash-to-dock/) => dock栏(★★★★★)
* [Dash To Panel](https://extensions.gnome.org/extension/1160/dash-to-panel/) => 将dock和顶栏显示在一起(★★★★★)
* [NoAnnoyance](https://extensions.gnome.org/extension/1236/noannoyance/) => 禁用多余的pop提示信息，直接提升活动窗口(★★★★★)
* [Autohide Battery](https://extensions.gnome.org/extension/595/autohide-battery/) => 电池充满并连接电源时自动隐藏电池按钮(★★★★★)
* [Places Status Indicator](https://extensions.gnome.org/extension/8/places-status-indicator/) => 顶部任务栏显示磁盘和卷的快捷入口(★★★★★)
* [Removable Drive Menu](https://extensions.gnome.org/extension/7/removable-drive-menu/) => 顶部任务栏显示可移除的已挂载设备(★★★★★)
* [Suspend Button](https://extensions.gnome.org/extension/826/suspend-button/) => 顶部菜单栏显示休眠按钮(★★★★★)
* [TopIcons](https://extensions.gnome.org/extension/495/topicons/) => 顶部通知图标托盘(★★★★★)
* [TopIconsPlus](https://extensions.gnome.org/extension/1031/topicons/) => 顶部通知图标托盘，自定义图标显示参数(★★★★☆)
* [Blyr](https://extensions.gnome.org/extension/1251/blyr/) => 模糊应用预览背景图(★★★★★)
* [Activities Configurator](https://extensions.gnome.org/extension/358/activities-configurator/) => 配置左上角活动按钮(★★★★☆)
* [Workspace to Dock](https://extensions.gnome.org/extension/427/workspaces-to-dock/) => 将工作区转换为悬浮dock(★★★★★)

#### Ubuntu18.04 插件 [ Dash to dock ] 一些常用设置
--------------------------------------------
```sh
#Use Custom Dock Indicator ( Optional )
$: gsettings set org.gnome.shell.extensions.dash-to-dock custom-theme-running-dots false
$: gsettings set org.gnome.shell.extensions.dash-to-dock custom-theme-customize-running-dots false
_______________________________________________________________________________________________

# Disable Custom Dock Shrink ( Required for Good looking) (  Required )
$: gsettings set org.gnome.shell.extensions.dash-to-dock custom-theme-shrink false
_______________________________________________________________________________________________

# Dock Transparency mode ( Optional )
$: gsettings set org.gnome.shell.extensions.dash-to-dock transparency-mode DEFAULT
_______________________________________________________________________________________________

# Restore to Default
$: dconf reset -f /org/gnome/shell/extensions/dash-to-dock/
_______________________________________________________________________________________________
```

#### Ubuntu18.04 主题
______________________________________________
* GTK3主题(★★★★☆) => [X-Arc-Collection](https://www.gnome-look.org/p/1167049/)
* GTK3主题(★★★★★) => [McOS-themes](https://www.gnome-look.org/p/1241688)
* Gnome Shell主题(★★★★) => [Flat-Remix](https://github.com/daniruiz/flat-remix)
* Gnome Shell主题(★★★☆) => [Human](https://www.gnome-look.org/p/1171095/)
* Gnome Shell主题(★★★★★) => [macOS High Sierra](https://www.opendesktop.org/c/1460761561)
* Gnome Shell主题(?) => [macOS High Sierra](https://www.gnome-look.org/p/1213208/)
* Icon 主题(★★★★) => [flat-remix](https://github.com/daniruiz/flat-remix/releases)
* Icon 主题(★★★★☆) => [Mac OS X Icon](https://www.gnome-look.org/p/1012200/)
* Icon 主题(★★★★★) => [la-capitaine-icon-theme](https://github.com/keeferrourke/la-capitaine-icon-theme/releases)
* Icon 主题(★★★★☆) => [MacOS sierra ct](https://github.com/zayronxio/Macos-sierra-CT)
* Cursor主题(★★★★☆) => [Capitaine Cursors](https://krourke.org/projects/art/capitaine-cursors)

#### chrome实用插件整理
-----------------------------------
* [infinity pro 标签页](https://chrome.google.com/webstore/detail/infinity-new-tabproductiv/dbfmnekepjoapopniengjbcpnbljalfg?utm_source=InfinityNewtab) => 主页标签管理器(★★★★★)
* [Octotree](https://chrome.google.com/webstore/detail/octotree/bkhaagjahfmjljalopjnoealnfndnagc?utm_source=InfinityNewtab) => github仓库文件资源浏览树(★★★★★)
* [Postman](https://chrome.google.com/webstore/detail/postman-interceptor/aicmkgpgakddgnaphhhpliifpcfhicfo?utm_source=InfinityNewtab) => API测试和请求模拟器(★★★★★)
* [SwitchyOmega](https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif?utm_source=InfinityNewtab) => 大家都用的代理软件(★★★★★)
* [印象笔记剪藏](https://chrome.google.com/webstore/detail/evernote-web-clipper/pioclpoplcdbaefihamjohnefbikjilc?utm_source=InfinityNewtab) => 随时随地把网络资源保存到你的笔记本里(★★★★★)
* [SimpRead](https://chrome.google.com/webstore/detail/simpread-reader-view/ijllcpnolfcooahcekpamkbidhejabll?utm_source=InfinityNewtab) => 让浏览器支持纯净的阅读模式(★★★★★)
* [Full Page Screen Capture](https://chrome.google.com/webstore/detail/full-page-screen-capture/fdpohaocaechififmbbbbbknoalclacl?utm_source=InfinityNewtab) => 全屏截图(★★★★☆)
* [油猴tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?utm_source=InfinityNewtab) => 用户脚本管理器，一个用例是破解badu网盘的限速(★★★★★)
* [Checker Plus for Gmail](https://chrome.google.com/webstore/detail/checker-plus-for-gmail/oeopbcgkkoapgobdbedcemjljbihmemj?utm_source=InfinityNewtab) => Google邮件提示插件(★★★★☆)
* [Vimium](https://chrome.google.com/webstore/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb?utm_source=InfinityNewtab) => 让google浏览器支持vim模式(firefox也有)(★★★★★)
* [拷贝为Markdown](https://chrome.google.com/webstore/detail/copy-as-markdown/dgoenpnkphkichnohepecnmpmihnabdg) => 将选中网页转化为markdown格式并发送到剪贴板(★★★★☆)

#### 实用程序和命令
_______________________________
* [vivaldi浏览器](https://vivaldi.com) => 可定制化程度高的个性化浏览器(★★★★★)
* Terminator => 默认gnome终端升级版(★★★★★)
* Timeshift => 创建系统快照，增量备份(★★★★★)
* ipython3(命令工具) => python交互解释器(★★★★★)
* jupyter => 交互式数据分析和记录工具(★★★★☆)
* pdb/ipdb(命令工具) => python调试器(★★★★☆)
* trash-cli(命令工具) => 命令行回收站(★★★★★)
* bat(命令工具) => cat升级版，支持语法高亮和git状态显示(★★★★★)
* axel(命令工具) => 下载限速不存在的，如果存在那我就开100个下载线程 : )(★★★★☆)
* [aria2(命令工具)](https://github.com/aria2/aria2) => 强大的命令行下载工具
* [stacer](https://github.com/oguzhaninan/Stacer) => linux电脑管家(★★★★★)
* [ieaseMusic](https://github.com/trazyn/ieaseMusic) => 网易云音乐第三方客户端，没有bug，不会退出后再打开就让重新登陆，界面还很酷(★★★★★)
* parallel(命令工具) => 利用系统的多核来并行执行你的程序(★★★★☆)
* cheat(命令工具) => 类似man命令的功能，简洁高效(★★★★☆)
* topgrade(命令工具) => 一个命令更新所有软件(★★★★)
* [dbKoda](https://www.dbkoda.com/) => mongodb GUI工具(★★★★☆)
* [mongodb compass](https://www.mongodb.com/products/compass) => mongodb GUI工具(★★★★)
* [peek](https://github.com/phw/peek) => 屏幕录制工具，支持输出gif/webm/apng/webm格式的媒体文件(★★★★☆)
* tmux => 终端管理器(★★★★)
* 深度终端(ubuntu商店下载) => 支持分屏，内置实用主题(★★★★☆)
* 深度截图(ubuntu商店下载) => 支持截图编辑(★★★★★)
* [WebTorrent](https://webtorrent.io/desktop/)、[FrostWire](https://www.frostwire.com/) => bt下载工具，支持边下边播(★★★★)
* [SmartGit](https://www.syntevo.com/smartgit/) => linux平台免费的GIT GUI工具(★★★★★)
* FileZilla => ftp工具(★★★★★)
* [e-tools](https://github.com/Suremotoo/e-tools) => coder常用小工具(★★★★)
* [WhatEver](https://electronjs.org/apps/whatever) => linux第三方印象笔记客户端，基于网页版(★★★★)
* [wps](http://linux.wps.cn/) => linux office for free made by KingSoftware(★★★★★)
* [Atom](https://atom.io/) => 我一直在用的编辑器，没有固态硬盘的不推荐使用(★★★★☆)
* [vscode](https://code.visualstudio.com/) => 轻量化编辑器，没有Atom人性化，但是很快。都是JS写的，性能差距咋这么大呢 ? (★★★★★)
* ndb => node.js/javascript 调试器(★★★★★)
* [nvm](https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh) => nodejs版本管理器
* albert (添加软件源 `ppa:noobslab/macbuntu` 安装 ) => 桌面全局搜索类似Mac系统的SpotLight(★★★★★)

#### 实用网站推荐
_______________
![infinity.png](https://upload-images.jianshu.io/upload_images/3019242-8cb909b68a48dd3f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

* [Wallpaper](https://wallpapershome.com/)  => 高清桌面壁纸下载，支持多种分辨率(★★★★★)
* [flaticon](https://www.flaticon.com) => 免费图标下载网站，支持svg和png两种格式
* [Electron Apps](https://electronjs.org/apps) => 有很多Electron 框架写的跨平台应用(Linux/Mac/Windows)(★★★★☆)
* [Linux运维日志](https://www.centos.bz/) => 服务搭建、Linux技术之类的(★★★★☆)
* [IBM Developer](https://www.ibm.com/developerworks/cn/) => 技术文档类的参考(★★★★★)
* [Linux常用命令](https://www.lulinux.com/archives/2513#awk)  =>  常用命令速查(★★★★☆)
* [bilibili工具网站](https://www.kanbilibili.com/) => 支持 视频/弹幕/封面 下载等骚操作(★★★★★)
* [Linux中国](https://linux.cn/) => 没事儿就上去看看别人翻译转载的文章(★★★★☆)
* [TinyPNG](https://tinypng.com/) => 免费的图片无损压缩网站(★★★★☆)
* [iLoveIMG](https://www.iloveimg.com/zh-cn) => 在线图片编辑网站(★★★★★)
* [savefrom](https://en.savefrom.net/) => 直接下载youtube视频(★★★★☆)
* [撸Linux](https://www.lulinux.com/) => 好像还蛮有趣的额(★★★★☆)
* [油猴脚本](https://greasyfork.org/zh-CN/scripts) => 你甚至可以用来破解百度云限速(★★★★★)
