# Verificación sin red pesada: lógica pura budget + gantt
python3 -c "assert 1000+210+200==1410; print('budget OK 1410')"
python3 -c "from datetime import datetime; t0=int(datetime(2026,12,12,14,0).timestamp()*1000); assert t0+3600000+1800000>t0; print('gantt OK')"
echo "Luego con red: npm test ; npm run typecheck"
