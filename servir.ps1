param([int]$Porta = 8080)
$ErrorActionPreference = 'Stop'
$raizSite = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'sistema-agroflorestal'))
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $Porta)
$listener.Start()
Write-Host "Raiz em http://localhost:$Porta - Ctrl+C para encerrar."
$tipos = @{ '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.json' = 'application/json; charset=utf-8'; '.svg' = 'image/svg+xml'; '.png' = 'image/png' }
try {
  while ($true) {
    $cliente = $listener.AcceptTcpClient()
    try {
      $cliente.ReceiveTimeout = 3000
      $fluxo = $cliente.GetStream()
      $leitor = [IO.StreamReader]::new($fluxo, [Text.Encoding]::ASCII, $false, 1024, $true)
      $linha = $leitor.ReadLine()
      if (!$linha) { continue }
      do { $cabecalho = $leitor.ReadLine() } while ($cabecalho)
      $partes = $linha.Split(' ')
      $caminhoUrl = [Uri]::UnescapeDataString(($partes[1] -split '\?')[0])
      if ($caminhoUrl -eq '/') { $caminhoUrl = '/index.html' }
      $caminhoArquivo = [IO.Path]::GetFullPath((Join-Path $raizSite $caminhoUrl.TrimStart('/')))
      $codigo = '200 OK'
      $tipo = $tipos[[IO.Path]::GetExtension($caminhoArquivo)]
      if (!$tipo) { $tipo = 'application/octet-stream' }
      if ($partes[0] -ne 'GET') {
        $codigo = '405 Method Not Allowed'
        $conteudo = [Text.Encoding]::UTF8.GetBytes('Metodo nao permitido.')
      } elseif (!$caminhoArquivo.StartsWith($raizSite + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase) -or !(Test-Path -LiteralPath $caminhoArquivo -PathType Leaf)) {
        $codigo = '404 Not Found'
        $conteudo = [Text.Encoding]::UTF8.GetBytes('Arquivo nao encontrado.')
      } else {
        $conteudo = [IO.File]::ReadAllBytes($caminhoArquivo)
      }
      $resposta = [Text.Encoding]::ASCII.GetBytes("HTTP/1.1 $codigo`r`nContent-Type: $tipo`r`nContent-Length: $($conteudo.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n")
      $fluxo.Write($resposta, 0, $resposta.Length)
      $fluxo.Write($conteudo, 0, $conteudo.Length)
    } catch {
      Write-Warning 'Uma conexao local foi interrompida.'
    } finally {
      $cliente.Dispose()
    }
  }
} finally {
  $listener.Stop()
}
