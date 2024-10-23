FROM ubuntu:latest

WORKDIR /root

RUN apt-get update && apt-get install curl git python3 -y

RUN curl -fsSL https://code-server.dev/install.sh | sh

RUN mkdir -p /root/.config/code-server
RUN printf "bind-addr: 0.0.0.0:8080\nauth: password\ncert: false" > /root/.config/code-server/config.yaml

RUN mkdir -p /root/.local/share/code-server/User
RUN printf "{\"workbench.colorTheme\": \"Default Dark Modern\"}" > /root/.local/share/code-server/User/settings.json

RUN git clone https://github.com/osc-vitap/gitty-up.git

WORKDIR /app
RUN git init
RUN cp /root/gitty-up/hooks/pre-commit .git/hooks/
RUN chmod +x .git/hooks/pre-commit

EXPOSE 8080

# CMD code-server -w "$(echo Hello, $REG_NO)" -an $REG_NO
CMD code-server -w "$(echo "Hello, $REG_NO")" -an "$REG_NO" .