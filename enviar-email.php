<?php
// Verificar se o formulário foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Coletar dados do formulário
    $name = htmlspecialchars($_POST['name'] ?? '');
    $email = htmlspecialchars($_POST['email'] ?? '');
    $phone = htmlspecialchars($_POST['phone'] ?? '');
    $subject = htmlspecialchars($_POST['subject'] ?? '');
    $message = htmlspecialchars($_POST['message'] ?? '');
    
    // Validações básicas
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Por favor, preencha todos os campos obrigatórios.']);
        exit;
    }
    
    // Validar email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Por favor, insira um e-mail válido.']);
        exit;
    }
    
    // Configurações SMTP
    $smtp_host = 'mail.bioadubo.com.br';
    $smtp_port = 465; // Porta SSL/TLS
    $smtp_user = 'bioadubo@bioadubo.com.br';
    $smtp_pass = 'SUA_SENHA_AQUI'; // SUBSTITUIR PELA SENHA REAL
    $to_email = 'bioadubo@bioadubo.com.br';
    
    // Assunto do e-mail
    $email_subject = "Novo contato do site - " . $subject;
    
    // Montar corpo do e-mail
    $email_body = "Novo contato recebido no site Minha Hortinha\n\n";
    $email_body .= "Nome: " . $name . "\n";
    $email_body .= "E-mail: " . $email . "\n";
    $email_body .= "Telefone: " . ($phone ? $phone : "Não informado") . "\n";
    $email_body .= "Assunto: " . $subject . "\n\n";
    $email_body .= "Mensagem:\n";
    $email_body .= $message . "\n\n";
    $email_body .= "---\n";
    $email_body .= "Enviado via formulário de contato do site";
    
    // Usar fsockopen para enviar via SMTP
    $errno = null;
    $errstr = null;
    $out = '';
    
    // Conectar ao servidor SMTP
    $fp = @fsockopen('ssl://' . $smtp_host, $smtp_port, $errno, $errstr, 10);
    
    if (!$fp) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao conectar ao servidor de e-mail. Tente novamente mais tarde.']);
        exit;
    }
    
    // Função para enviar comando SMTP
    function send_smtp_command($fp, $cmd) {
        fwrite($fp, $cmd . "\r\n");
        $response = fgets($fp, 1024);
        return $response;
    }
    
    // Autenticação SMTP
    $response = fgets($fp, 1024);
    
    // EHLO
    send_smtp_command($fp, 'EHLO ' . $_SERVER['SERVER_NAME']);
    send_smtp_command($fp, 'AUTH LOGIN');
    send_smtp_command($fp, base64_encode($smtp_user));
    send_smtp_command($fp, base64_encode($smtp_pass));
    
    // FROM
    send_smtp_command($fp, 'MAIL FROM:<' . $smtp_user . '>');
    
    // TO
    send_smtp_command($fp, 'RCPT TO:<' . $to_email . '>');
    
    // DATA
    send_smtp_command($fp, 'DATA');
    
    // Headers e corpo
    $headers = "From: " . $smtp_user . "\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "Subject: " . $email_subject . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    fwrite($fp, $headers . "\r\n" . $email_body . "\r\n.\r\n");
    
    // QUIT
    send_smtp_command($fp, 'QUIT');
    fclose($fp);
    
    echo json_encode(['success' => true, 'message' => 'Mensagem enviada com sucesso! Entraremos em contato em breve.']);
    exit;
}
?>

