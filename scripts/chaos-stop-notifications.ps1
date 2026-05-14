kubectl scale deployment notification-deployment --replicas=0
kubectl get deployment notification-deployment
Start-Sleep -Seconds 10
kubectl scale deployment notification-deployment --replicas=2
kubectl get deployment notification-deployment