local resourceName = GetCurrentResourceName()

CreateThread(function()
    while not NetworkIsSessionStarted() do
        Wait(0)
    end

    Wait(1500)
    ShutdownLoadingScreenNui()
end)

-- Using a spawn system (esx_spawn, qb-spawn)?
-- Remove the Wait(1500) + ShutdownLoadingScreenNui() above and use this instead:
--
-- AddEventHandler('yourSpawnEvent', function()
--     ShutdownLoadingScreenNui()
-- end)

AddEventHandler('onClientResourceStart', function(res)
    if res ~= resourceName then return end
    print(('[%s] Loading screen started'):format(resourceName))
end)
