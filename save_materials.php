<?php
// save_materials.php
$data = json_decode(file_get_contents('php://input'), true);

if (is_array($data)) {
  $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

  $file = 'materials.json';
  if (file_put_contents($file, $json) !== false) {
    http_response_code(200);
    echo json_encode(['status' => 'success', 'message' => '保存成功']);
  } else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => '写入失败']);
  }
} else {
  http_response_code(400);
  echo json_encode(['status' => 'error', 'message' => '数据格式错误']);
}
?>
