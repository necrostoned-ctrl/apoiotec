import { execSync } from 'child_process';
import * as crypto from 'crypto';

/**
 * Gera um fingerprint único e estável do servidor
 * Funciona em: Ubuntu, CentOS, Debian, Rocky Linux, Replit
 * Não muda entre reinicializações (a menos que o hardware mude)
 */
export async function generateHardwareFingerprint(): Promise<string> {
  try {
    const parts: string[] = [];
    let hardwareCount = 0;

    // 1. Serial do sistema (DMI) - mais confiável em servidores
    try {
      const systemSerial = execSync(
        'cat /sys/class/dmi/id/system_serial_number 2>/dev/null || dmidecode -s system-serial-number 2>/dev/null || echo "unknown"',
        { encoding: 'utf-8', timeout: 3000, stdio: ['pipe', 'pipe', 'ignore'] }
      ).trim();
      if (systemSerial && systemSerial !== 'unknown') {
        parts.push(`sys:${systemSerial}`);
        hardwareCount++;
      }
    } catch (e) {
      // Ignorar silenciosamente
    }

    // 2. MAC Address da primeira placa de rede (física)
    try {
      const mac = execSync(
        "cat /sys/class/net/*/address | head -1 || echo 'unknown'",
        { encoding: 'utf-8', timeout: 3000, stdio: ['pipe', 'pipe', 'ignore'] }
      ).trim();
      if (mac && mac !== 'unknown' && /^([0-9a-fA-F]{2}:){5}([0-9a-fA-F]{2})$/.test(mac)) {
        parts.push(`mac:${mac}`);
        hardwareCount++;
      }
    } catch (e) {
      // Ignorar silenciosamente
    }

    // 3. Serial do disco principal (sda)
    try {
      const diskSerial = execSync(
        'cat /sys/block/sda/device/serial 2>/dev/null || cat /proc/scsi/scsi 2>/dev/null | grep "Serial Number" | head -1 | awk "{print \\$NF}" || echo "unknown"',
        { encoding: 'utf-8', timeout: 3000, stdio: ['pipe', 'pipe', 'ignore'] }
      ).trim();
      if (diskSerial && diskSerial !== 'unknown') {
        parts.push(`disk:${diskSerial}`);
        hardwareCount++;
      }
    } catch (e) {
      // Ignorar silenciosamente
    }

    // 4. UUID da partição root (mais estável que ID físico)
    try {
      const uuid = execSync(
        "blkid -o value -s UUID / 2>/dev/null || grep ' / ' /etc/fstab | awk '{print $1}' | head -1 || echo 'unknown'",
        { encoding: 'utf-8', timeout: 3000, stdio: ['pipe', 'pipe', 'ignore'] }
      ).trim();
      if (uuid && uuid !== 'unknown') {
        parts.push(`uuid:${uuid}`);
        hardwareCount++;
      }
    } catch (e) {
      // Ignorar silenciosamente
    }

    // 5. ID único da máquina (geralmente gerado na instalação)
    try {
      const machineId = execSync(
        'cat /etc/machine-id 2>/dev/null || cat /var/lib/dbus/machine-id 2>/dev/null || echo "unknown"',
        { encoding: 'utf-8', timeout: 3000, stdio: ['pipe', 'pipe', 'ignore'] }
      ).trim();
      if (machineId && machineId !== 'unknown') {
        parts.push(`mid:${machineId}`);
        hardwareCount++;
      }
    } catch (e) {
      // Ignorar silenciosamente
    }

    // Se conseguiu dados de hardware real, usar isso
    if (hardwareCount >= 2) {
      const combined = parts.join('|');
      const hash = crypto.createHash('sha256').update(combined).digest('hex');
      
      console.log(`✅ Hardware fingerprint gerado (${hardwareCount} componentes)`);
      console.log(`   Hash: ${hash.substring(0, 16)}...`);
      console.log(`   Tipo: Hardware Real (Produção)`);
      
      return hash;
    }

    // Fallback: Se está no Replit ou não conseguiu hardware suficiente
    console.warn('⚠️  Não foi possível obter dados de hardware suficientes, tentando fallback Replit...');
    
    const replitId = process.env.REPLIT_ID;
    const replitOwner = process.env.REPLIT_OWNER;
    
    if (replitId) {
      // Replit usa esse ID como fallback
      const combined = `replit:${replitId}:${replitOwner || 'no-owner'}`;
      const hash = crypto.createHash('sha256').update(combined).digest('hex');
      
      console.log(`✅ Fingerprint gerado (Replit)`);
      console.log(`   Hash: ${hash.substring(0, 16)}...`);
      console.log(`   Tipo: Replit (Fallback)`);
      
      return hash;
    }

    // Último recurso: hostname
    const hostname = execSync('hostname', {
      encoding: 'utf-8',
      timeout: 3000,
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
    
    if (hostname) {
      const combined = `host:${hostname}`;
      const hash = crypto.createHash('sha256').update(combined).digest('hex');
      
      console.log(`⚠️  Fingerprint gerado (Hostname)`);
      console.log(`   Hash: ${hash.substring(0, 16)}...`);
      console.log(`   Tipo: Fallback (Pode variar)`);
      
      return hash;
    }

    throw new Error('Impossível gerar fingerprint - nenhuma informação disponível');
  } catch (error) {
    console.error('❌ Erro crítico ao gerar fingerprint:', error instanceof Error ? error.message : error);
    // Último recurso final - usar um ID aleatório
    const random = crypto.randomBytes(16).toString('hex');
    console.warn(`⚠️  Usando fallback aleatório: ${random.substring(0, 16)}...`);
    return random;
  }
}
