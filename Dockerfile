#Dockerfileは必ずFROM命令から始まる
#Dockerイメージはnode
FROM --platform=linux/x86_64 node:16.13.1

#RUN命令はコマンドを実行する
RUN apt-get update
RUN apt-get install -y locales vim tmux
RUN locale-gen ja_JP.UTF-8
RUN localedef -f UTF-8 -i ja_JP ja_JP

#ENV環境変数
ENV LANG ja_JP.UTF-8
ENV TZ Asia/Tokyo

#作業ディレクトリを指定する
WORKDIR /submarine