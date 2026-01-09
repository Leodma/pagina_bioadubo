<?php
// Verificar se o formulário foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Coletar dados do formulário
    $name = htmlspecialchars($_POST['name'] ?? '');
    $email = htmlspecialchars($_POST['email'] ?? '');
    $phone = htmlspecialchars($_POST['phone'] ?? '');
    $subject = htmlspecialchars($_POST['subject'] ?? '');
    $message = htmlspecialchars($_POST['message'] ?? '');
    
    // Identificar de qual formulário a requisição vem (presença do campo "privacy")
    $is_minha_hortinha = isset($_POST['privacy']);
    $form_source = $is_minha_hortinha ? 'Minha Hortinha' : 'Contato';
    
    // Validações básicas - obrigatórias em ambos os formulários
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
    
    // Validar privacy apenas se for do formulário Minha Hortinha
    if ($is_minha_hortinha && !isset($_POST['privacy'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Por favor, concorde com os termos de privacidade.']);
        exit;
    }
    
    // Configuração de e-mails
    $from_email = 'osvaldo@bioadubo.com.br';  // Email de envio
    $to_email = 'bioadubo@bioadubo.com.br';    // Email de recebimento
    
    // Assunto do e-mail (com identificação da origem)
    $email_subject = "Novo contato - " . $form_source . " - " . $subject;
    
    // Montar corpo do e-mail
    $email_body = "Novo contato recebido via formulário: " . $form_source . "\n\n";
    $email_body .= "--- DADOS DO VISITANTE ---\n";
    $email_body .= "Nome: " . $name . "\n";
    $email_body .= "E-mail: " . $email . "\n";
    $email_body .= "Telefone: " . ($phone ? $phone : "Não informado") . "\n";
    $email_body .= "Assunto: " . $subject . "\n";
    if ($is_minha_hortinha) {
        $email_body .= "Autorizado para contato via e-mail: Sim\n";
    }
    $email_body .= "\n--- MENSAGEM ---\n";
    $email_body .= $message . "\n\n";
    $email_body .= "---\n";
    $email_body .= "Enviado via formulário de contato do site Bioadubo";
    
    // Headers do e-mail
    $headers = "From: " . $from_email . "\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    // Enviar e-mail usando função nativa mail()
    $mail_sent = mail($to_email, $email_subject, $email_body, $headers);
    
    if ($mail_sent) {
        echo json_encode(['success' => true, 'message' => 'Mensagem enviada com sucesso! Entraremos em contato em breve.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao enviar e-mail. Tente novamente mais tarde.']);
    }
    exit;
}


?>

